"use server";

import { db } from "~/server/db";
import {
  comments,
  follows,
  likes,
  posts,
  reports,
  users,
} from "~/server/db/schema";
import { desc } from "drizzle-orm/sql/expressions/select";
import { and, eq, inArray, or } from "drizzle-orm/sql/expressions/conditions";
import type { profile, post } from "~/app/_functions/interfaces";
import {
  getAverageEmbedding,
  getEmbedding,
  getPostEmbeddings,
} from "~/app/_functions/embedding";
import { auth } from "@clerk/nextjs/server";
import {
  embeddingFromID,
  insertPinecone,
  pineconeDelete,
  searchPinecone,
} from "~/server/api/server-only";

export async function updateUserProfile(
  newBio: string,
  newLocation: string,
  newSkills: string,
  newWebsite: string,
) {
  const clerkUser = auth();
  if (clerkUser?.userId) {
    return db
      .update(users)
      .set({
        bio: newBio,
        location: newLocation,
        skills: newSkills,
        website: newWebsite,
      })
      .where(eq(users.clerk_id, clerkUser.userId))
      .returning();
  }
}

export async function dbEditPost(post: post, content: string, user_id: number) {
  try {
    await db
      .update(posts)
      .set({
        content: content,
        updated_at: Date.now(),
      })
      .where(and(eq(posts.author_id, user_id), eq(posts.id, post.id)));
    const newEmbedding = await getEmbedding(content);
    void (await insertPinecone("posts", newEmbedding, post.id));
    return true;
  } catch {
    return false;
  }
}

export async function dbReportPost(post: post, user_id: number) {
  const oldReport = await db.query.reports.findFirst({
    where: and(eq(reports.post_id, post.id), eq(reports.reporter_id, user_id)),
  });
  if (!oldReport) {
    return db
      .insert(reports)
      .values({
        post_id: post.id,
        reporter_id: user_id,
        reported_at: Date.now(),
      })
      .returning();
  } else {
    return "duplicate";
  }
}

export async function getDbUser(clerkId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerk_id, clerkId),
  });
}
export async function getDbUserFromId(user_id: number) {
  return db.query.users.findFirst({
    where: eq(users.id, user_id),
    columns: {
      clerk_id: false,
      recent_likes: false,
    },
    with: {
      posts: true,
    },
  });
}

export async function isUserFollowing(user_id: number, following_id: number) {
  return db.query.follows.findFirst({
    where: and(
      eq(follows.user_id, user_id),
      eq(follows.following_user_id, following_id),
    ),
  });
}

export async function singlePost(post_id: number) {
  return db.query.posts.findFirst({
    where: eq(posts.id, post_id),
    with: {
      author: {
        columns: {
          recent_likes: false,
        },
      },
      likes: {
        columns: {
          user_id: true,
        },
      },
      comments: {
        columns: {
          id: true,
        },
      },
    },
  });
}

export async function nextPostPage(page: number, post_id: number) {
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  return db.query.comments.findMany({
    orderBy: desc(comments.created_at),
    where: eq(comments.post_id, post_id),
    offset: offset,
    limit: pageSize,
    with: {
      author: {
        columns: {
          image_url: true,
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getHomePageOrder(user_id?: number) {
  if (user_id) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, user_id),
    });
    if (user?.id) {
      const userEmbedding = await embeddingFromID("users", user.id);
      if (userEmbedding) {
        const relevant = await searchPinecone("posts", userEmbedding);
        return relevant.map((id) => Number(id));
      } else {
        return [];
      }
    } else {
      console.log("No user.id found");
      return [];
    }
  } else {
    console.log("No user_id given");
    return [];
  }
}

export async function nextHomePage(
  page: number,
  user_id?: number,
  postIds?: number[],
) {
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  if (user_id) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, user_id),
    });
    if (user?.id && postIds && postIds?.length > 0) {
      postIds = postIds.slice(offset, offset + pageSize);
      if (postIds?.length > 0) {
        const uoPosts = await db.query.posts.findMany({
          where: inArray(posts.id, postIds),
          with: {
            author: {
              columns: {
                id: true,
                image_url: true,
                name: true,
              },
            },
            comments: {
              columns: {
                id: true,
              },
            },
            likes: {
              columns: {
                user_id: true,
              },
            },
          },
        });
        return uoPosts.sort((a, b) => {
          // @ts-expect-error i fucking hate ts
          const indexA = postIds.indexOf(a.id);
          // @ts-expect-error i fucking hate ts
          const indexB = postIds.indexOf(b.id);
          return indexA - indexB;
        });
      } else {
        return null;
      }
    }
  }
  // No userID or postIds list or whatever - return chronological home page
  return db.query.posts.findMany({
    orderBy: desc(posts.updated_at),
    limit: pageSize,
    offset: offset,
    with: {
      author: {
        columns: {
          id: true,
          image_url: true,
          name: true,
        },
      },
      comments: {
        columns: {
          id: true,
        },
      },
      likes: {
        columns: {
          user_id: true,
        },
      },
    },
  });
}

// export async function getSinglePost(post_id: number) {
//   return db.query.posts.findFirst({
//     where: eq(posts.id, post_id),
//     columns: {
//       embedding: false,
//     },
//   });
// }

export async function updateProfile(profile: profile) {
  return db
    .update(users)
    .set({
      image_url: `${profile.data.image_url}`,
      name: `${profile.data.first_name ? profile.data.first_name : "Unknown"} ${profile.data.last_name ? profile.data.last_name : ""} `,
    })
    .where(eq(users.clerk_id, profile.data.id))
    .returning();
}

export async function createProfile(profile: profile) {
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.clerk_id, profile.data.id),
  });
  if (!user) {
    return db
      .insert(users)
      .values({
        clerk_id: profile.data.id,
        name: `${profile.data.first_name ? profile.data.first_name : "Unknown"} ${profile.data.last_name ? profile.data.last_name : ""} `,
        image_url: profile.data.image_url,
        recent_likes: [],
        new_likes: [],
      })
      .returning();
  }
}

export async function dbDeletePost(post: post) {
  void (await pineconeDelete([post.id], "posts"));
  await db.delete(comments).where(eq(comments.post_id, post.id));
  await db.delete(likes).where(eq(likes.post_id, post.id));
  await db.delete(posts).where(eq(posts.id, post.id));
  return "Deleted";
}

export async function deleteProfile(profile: profile) {
  console.log("deleteProfile()", profile.data.id);
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.clerk_id, profile.data.id),
  });
  console.log("Got user");
  if (user) {
    const deletedPosts: { post_id: number }[] = await db
      .delete(posts)
      .where(eq(posts.author_id, user.id))
      .returning({ post_id: posts.id });
    console.log("Deleted posts (w/ return)");
    const postIds = deletedPosts.map((post) => post.post_id);
    console.log("Converted post {}[] to []");
    await pineconeDelete(postIds, "posts");
    console.log("Deleted user's posts from pinecone");
    await db
      .delete(comments)
      .where(
        or(eq(comments.author_id, user.id), inArray(comments.post_id, postIds)),
      );
    console.log("Deleted comments associated with post []");
    await db
      .delete(likes)
      .where(or(eq(likes.user_id, user.id), inArray(likes.post_id, postIds)));
    console.log("Deleted likes associated with user");
    await db
      .delete(follows)
      .where(
        or(
          eq(follows.user_id, user.id),
          eq(follows.following_user_id, user.id),
        ),
      );
    console.log("Deleted follows associated with user");
    console.log(`Deleting user ${profile.data.id}`);
    return db.delete(users).where(eq(users.clerk_id, profile.data.id));
  } else {
    console.log("User not found");
    return null;
  }
}

// export async function deletePost(post: post) {
//   console.log("Cascading (delete) post ", post.id)
//   await db.delete(comments)
//     .where(eq(comments.post_id, post.id));
//   await db.delete(likes)
//     .where(eq(likes.post_id, post.id));
//   await db
//     .delete(posts)
//     .where(eq(posts.id, post.id))
// }

export async function searchEmbeddings(search: string) {
  const searchEmbedding = await getEmbedding(search);
  return await searchPinecone("posts", searchEmbedding);
}

export async function updateEmbed() {
  const user = auth();
  if (user?.userId) {
    void (await updateUserEmbed(user?.userId));
    return 0;
  } else {
    return 1;
  }
}

export async function resetUserEmbed(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerk_id, userId),
  });
  if (user) {
    await pineconeDelete([user.id], "users");
    await db
      .update(users)
      .set({
        recent_likes: [],
        new_likes: [],
      })
      .where(eq(users.clerk_id, userId));
    return 0;
  }
  return 1;
}

export async function updateUserEmbed(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerk_id, userId),
  });
  if (user) {
    // const following = await db.query.follows.findMany({
    //   where: eq(follows.user_id, user.id),
    //   with: {
    //     following_user: {
    //       columns: {},
    //       with: {
    //         posts: {
    //           columns: {
    //             id: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    // });
    let oldEmbedding = await embeddingFromID("users", user.id);
    if (!oldEmbedding) {
      oldEmbedding = [];
      for (let i = 0; i < 1535; i++) {
        oldEmbedding.push(0);
      }
      oldEmbedding.push(0.000001);
    }
    const rlAmount = user.recent_likes.length;
    const nlAmount = user.new_likes.length;
    const newEmbeddings = await getPostEmbeddings(user.new_likes);
    if (newEmbeddings.length == 0) {
      console.log("Nothing to refresh");
    }
    if (newEmbeddings.length > 0 && oldEmbedding) {
      const userEmbedding = await getAverageEmbedding(
        oldEmbedding,
        rlAmount,
        newEmbeddings,
        nlAmount,
      );
      void (await insertPinecone("users", userEmbedding, user.id));
      await db
        .update(users)
        .set({
          recent_likes: [...user.recent_likes, ...user.new_likes],
          new_likes: [],
        })
        .where(eq(users.id, user.id));
      return 0;
    }
  }
  return 1;
}

const tweets = [
  "Just spent the entire day debugging a single line of code. Turns out, I missed a semicolon. #ProgrammerLife",
  "Excited to announce that our new app is now live! Check it out and let us know what you think.",
  "JavaScript is like a box of chocolates. You never know what you're going to get when you start typing.",
  "Trying to explain to my non-programmer friends what I do for a living is like trying to explain quantum physics to a toddler.",
  "Just discovered a new JavaScript library that's going to make my life so much easier. Where has this been all my life?",
  "When you've been staring at your code for so long that it starts to look like hieroglyphics. Time for a coffee break.",
  "Spent the day at the beach with my family. Sometimes you just need to unplug and recharge.",
  "JavaScript is the duct tape of the internet. It's not always pretty, but it gets the job done.",
  "I love the feeling of finally solving a difficult programming problem. It's like a mental marathon.",
  "Just released a new JavaScript tutorial on my YouTube channel. Check it out and let me know what you think!",
  "I swear, sometimes I think my computer is just messing with me. It's like it knows when I'm on a deadline.",
  "Why do programmers prefer dark mode? Because light attracts bugs!",
  "Trying to learn a new programming language is like learning a new spoken language. It takes time and practice.",
  "Just finished a 5k run. Feeling accomplished and ready to tackle the day.",
  "JavaScript frameworks are like fashion trends. They come and go so quickly, it's hard to keep up.",
  "I love the collaborative nature of open-source programming. It's like having a huge team of coworkers all over the world.",
  "When you accidentally delete a huge chunk of code and can't find the undo button. Panic mode engaged.",
  "Baking some homemade bread today. There's something so satisfying about making things from scratch.",
  "JavaScript is the Swiss Army knife of programming languages. It can do just about anything.",
  "I think I've had more coffee than water today. Such is the life of a programmer.",
  "Just launched a new website for a client. It's always rewarding to see a project come to life.",
  "I love how programming allows me to be creative and analytical at the same time. It's the perfect blend of art and science.",
  "Watching old episodes of The Office. Never fails to make me laugh.",
  "JavaScript arrow functions are like shortcuts for your code. They make everything faster and more concise.",
  "It's amazing how much technology has advanced in just the past decade. Exciting to think about what the future holds.",
  "Sometimes I dream in code. Is that normal?",
  "Going camping this weekend. Can't wait to unplug and enjoy nature.",
  "When you finally finish a project and realize you have no idea how to explain it to anyone else.",
  "I love how programming languages are constantly evolving. There's always something new to learn.",
  "Just got back from a tech conference. My brain is overflowing with new ideas and inspiration.",
  "JavaScript promises are like IOUs for your code. They guarantee something will happen, even if it takes a while.",
  "Celebrating my birthday today. Feeling grateful for another year of life and learning.",
  "When you're debugging and you realize the problem is between the keyboard and the chair.",
  "I think every programmer should learn at least one low-level language. It gives you a whole new appreciation for what's happening under the hood.",
  "Trying out a new recipe for dinner tonight. Wish me luck!",
  "JavaScript closures are like secret agents. They have access to information that regular functions don't.",
  "I love the problem-solving aspect of programming. It's like a puzzle waiting to be solved.",
  "Enjoying a lazy Sunday morning with a good book and a cup of coffee.",
  "When you're reading someone else's code and suddenly realize why they left the company.",
  "Excited to be starting a new project today. Can't wait to dive in and start coding.",
  "JavaScript hoisting is like a magic trick. Variables and functions appear out of thin air!",
  "I think the best way to learn programming is by doing. You can't be afraid to make mistakes.",
  "Heading to the gym for a quick workout. Gotta keep the mind and body in shape.",
  "When you finally solve a bug that's been haunting you for days. Victory!",
  "I love how programming gives me the power to create something out of nothing. It's like being a digital wizard.",
  "Just booked a trip to Japan. Can't wait to immerse myself in a new culture.",
  "JavaScript template literals are like mad libs for your code. Fill in the blanks and watch the magic happen.",
  "I think the key to being a good programmer is being able to think like a computer. It's all about logic and algorithms.",
  "Watching the sunset and feeling grateful for another day.",
  "When you realize you've been coding for 8 hours straight and forgot to eat lunch. Oops.",
  "The advancements in AI are both exciting and frightening. It's like watching science fiction become reality.",
  "Just attended a fascinating webinar on the ethics of AI. It's a conversation we all need to be having.",
  "I wonder how long it will be before AI is writing all our code for us. Job security, anyone?",
  "Experimenting with a new AI-powered chatbot for our website. The possibilities are endless!",
  "The more I learn about AI, the more I realize how much I still have to learn. It's a humbling field.",
  "Can we talk about how creepy it is when ads start showing you things you were just talking about? AI is always listening.",
  "I'm convinced that AI will be the key to solving some of the world's biggest problems. Climate change, disease, poverty - AI could be our secret weapon.",
  "Just read an article about an AI that can compose classical music. As a musician, I'm both impressed and a little offended.",
  "I wonder if AI will ever be able to truly understand and mimic human emotions. Or will it always be a pale imitation?",
  "Teaching my kids about AI and the importance of being responsible with technology. It's never too early to start learning.",
  "The more advanced AI becomes, the more important it is that we have diverse voices involved in its development. We can't afford to leave anyone behind.",
  "I'm fascinated by the idea of AI-generated art. Will it ever be able to capture the soul and emotion of human-created art?",
  "Just watched a documentary on the history of AI. It's amazing to see how far we've come and to imagine where we might be headed.",
  "I can't help but wonder what the job market will look like in 10, 20, 30 years as AI continues to advance. Will we all be out of work?",
  "Attending a conference on AI in healthcare next month. Excited to learn about the latest breakthroughs and innovations.",
  "Sometimes I worry that we're becoming too reliant on AI. What happens when the machines inevitably fail or make a mistake?",
  "I'm convinced that the key to advancing AI is collaboration. No one company or country can do it alone.",
  "Just had a fascinating conversation with a coworker about the potential for AI in space exploration. The possibilities are endless!",
  "I wonder if AI will ever be able to truly pass the Turing test. Will we ever have conversations with machines and not realize it?",
  "The more I learn about AI, the more I realize that the future is not something to be feared, but something to be excited about.",

  // Web Development (20 tweets)
  "Just discovered a new CSS trick that's going to save me so much time. Where has this been all my life?",
  "Spent the day debugging a responsive design issue. The struggle is real.",
  "I love how web development is constantly evolving. There's always something new to learn and experiment with.",
  "Just launched a new web app for a client. Seeing it come to life is such a rewarding feeling.",
  "Attending a web development conference next week. Can't wait to geek out with like-minded people.",
  "I think every web developer should have a solid understanding of accessibility. It's not just a nice-to-have, it's a must-have.",
  "Just spent way too much time trying to center a div. Web development is not for the faint of heart.",
  "I'm convinced that the key to being a good web developer is being able to think like a user. Empathy is everything.",
  "Experimenting with a new JavaScript framework. The learning curve is steep but the payoff is worth it.",
  "Just had a client ask me to make their website 'pop' more. Sure, let me just add some sparkles and confetti.",
  "I love how web development allows me to be both creative and analytical. It's the perfect blend of art and science.",
  "Attending a hackathon this weekend. Can't wait to see what kind of crazy ideas people come up with.",
  "Just spent the day teaching a group of high school students about web development. Seeing their excitement and curiosity was so rewarding.",
  "I think the biggest challenge in web development is keeping up with the constant changes and new technologies. It's a never-ending race.",
  "Just discovered a new tool that's going to revolutionize my workflow. I feel like a kid on Christmas morning.",
  "I'm convinced that the future of web development is in AI and machine learning. The possibilities are endless.",
  "Spent the day working on a website for a nonprofit. Using my skills for good is the best feeling.",
  "I love how web development is a global community. I can collaborate with people from all over the world without ever leaving my desk.",
  "Just fixed a bug that's been haunting me for days. The sense of relief is indescribable.",
  "I think the key to being a successful web developer is being able to adapt and learn quickly. The landscape is always changing.",

  // Data Science (20 tweets)
  "Just started learning Python for data science. Wish me luck!",
  "I find it fascinating how data science can uncover hidden patterns and insights in seemingly random data.",
  "Attending a data science meetup tonight. Excited to learn from others in the field.",
  "I'm convinced that data literacy is going to be a crucial skill in the coming years. We all need to be able to understand and interpret data.",
  "Just finished a project using machine learning to predict customer churn. The results were eye-opening.",
  "I love how data science combines math, statistics, and computer science. It's like a nerdy trifecta.",
  "Spent the day cleaning and preprocessing data. Not the most glamorous part of data science, but so important.",
  "I think the biggest challenge in data science is communicating results to non-technical stakeholders. It's an art in itself.",
  "Just read an article about the ethical implications of big data. It's a conversation we all need to be having.",
  "I'm fascinated by the idea of using data science for social good. How can we use data to make the world a better place?",
  "Experimenting with a new data visualization library. A picture really is worth a thousand words.",
  "I think the key to being a good data scientist is being able to ask the right questions. Curiosity is everything.",
  "Just attended a workshop on deep learning. My brain hurts but in a good way.",
  "I love how data science is a collaborative field. No one person can know everything, so we all have to work together.",
  "Spent the day working on a predictive model for a healthcare client. The potential to save lives is both exciting and humbling.",
  "I'm convinced that the future of data science is in the cloud. The ability to process massive amounts of data quickly and cheaply is a game-changer.",
  "Just had a eureka moment while working on a data problem. Those moments make all the hard work worth it.",
  "I think the biggest misconception about data science is that it's all about the algorithms. In reality, it's just as much about domain expertise and communication.",
  "Attending a conference on data ethics next month. It's a critical topic that we all need to be thinking about.",
  "I love how data science is a field that welcomes people from all backgrounds. Diversity of thought is so important.",

  // Cybersecurity (20 tweets)
  "Just attended a terrifying webinar on the latest cyber threats. Time to update all my passwords... again.",
  "I'm convinced that cybersecurity is going to be one of the most important fields in the coming years. The stakes are just too high.",
  "Spent the day teaching my coworkers about phishing scams. It's scary how sophisticated they've gotten.",
  "I think the biggest challenge in cybersecurity is staying one step ahead of the bad guys. It's a constant game of cat and mouse.",
  "Just read an article about a major data breach. It's a reminder of how vulnerable we all are.",
  "I love how cybersecurity is a field that requires both technical skills and psychological understanding. You have to be able to think like a hacker.",
  "Attending a cybersecurity conference next week. Excited to learn about the latest tools and techniques.",
  "I'm fascinated by the idea of using AI and machine learning for cybersecurity. The potential is huge.",
  "Just finished a project helping a client recover from a ransomware attack. It's satisfying to know I'm helping keep people safe.",
  "I think the key to being a good cybersecurity professional is being able to communicate complex concepts to non-technical people. It's an essential skill.",
  "Experimenting with a new security tool. It's like a digital arms race out there.",
  "I love how cybersecurity is a field that's always evolving. There's always something new to learn and explore.",
  "Spent the day doing a deep dive on encryption algorithms. My brain is fried but in a good way.",
  "I'm convinced that the future of cybersecurity is in the cloud. The ability to scale and adapt quickly is crucial.",
  "Just had a conversation with a friend who doesn't believe in using antivirus software. I may have scared them straight.",
  "I think the biggest misconception about cybersecurity is that it's all about the technology. In reality, the human element is just as important.",
  "Attending a workshop on social engineering next month. It's scary how easily people can be manipulated.",
  "I love how cybersecurity is a field that requires collaboration across industries and borders. The threats are global, so the solutions have to be too.",
  "Just read about a new type of cyber attack. The creativity of hackers never ceases to amaze me.",
  "I'm excited to be mentoring a group of high school students interested in cybersecurity. We need more diverse voices in this field.",

  // Random (20 tweets)
  "Just tried a new coffee shop downtown. The latte art was almost too pretty to drink. Almost.",
  "I'm convinced that the key to happiness is a good night's sleep and a great cup of coffee in the morning.",
  "Spent the day organizing my closet. Why do I have so many shoes I never wear?",
  "I think the biggest challenge in life is figuring out what you're passionate about and then having the courage to pursue it.",
  "Just finished a great book. There's nothing like getting lost in a good story.",
  "I love how social media allows us to connect with people all over the world. It's a reminder of how much we all have in common.",
  "Attending a wine tasting event next weekend. I'm no sommelier, but I do know what I like.",
  "I'm fascinated by the idea of minimalism. How much stuff do we really need to be happy?",
  "Just had a great conversation with a stranger at the dog park. Sometimes the best conversations happen when you least expect them.",
  "I think the key to a good relationship is communication and laughter. And maybe a shared love of pizza.",
  "Experimenting with a new recipe tonight. Cooking is like therapy for me.",
  "I love how music has the power to transport you to another time and place. It's like a time machine for your emotions.",
  "Spent the day volunteering at a local charity. Giving back to the community always feels good.",
  "I'm convinced that the future is going to be shaped by the small, everyday actions we take. Every little bit counts.",
  "Just had a moment of gratitude for all the incredible people in my life. I'm so lucky.",
  "I think the biggest misconception about success is that it's about money or fame. In reality, it's about living a life true to yourself.",
  "Attending a meditation workshop next month. I'm skeptical but willing to give it a try.",
  "I love how art has the power to provoke, inspire, and heal. It's a universal language.",
  "Just read an article about the importance of failure. It's a tough pill to swallow, but so true.",
  "I'm excited to see what the future holds. With all the challenges we face, I still believe in the power of human ingenuity and compassion.",
];

// eslint-disable-next-line
export async function seedAllData() {
  console.log("Seeding data");
  for (const item of tweets) {
    const newPost = await db
      .insert(posts)
      .values({
        author_id: 13,
        content: `${item}`,
        post_tags: "",
        image_urls: [],
        created_at: Date.now(),
        updated_at: Date.now(),
      })
      .returning();
    const embedding = await getEmbedding(`${item}`);
    // @ts-expect-error fts
    void insertPinecone("posts", embedding, newPost[0].id);
    // @ts-expect-error fts
    console.log(`Inserted pinecone for post ${newPost[0].id}`);
  }
  console.log("FINISHED SEEDING");
  return 1;
}
