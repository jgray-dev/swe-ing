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
import { and, eq, or } from "drizzle-orm/sql/expressions/conditions";
import type { profile, post } from "~/app/_components/interfaces";
import {getAverageEmbedding, getEmbedding, getPostEmbeddings} from "~/app/_components/embedding";
import { l2Distance } from "pgvector/drizzle-orm";

export async function dbEditPost(post: post, content: string, user_id: number) {
  console.log("EDIT POST ", post.id);
  console.log("NEW COTNENT ", content);
  try {
    await db
      .update(posts)
      .set({
        content: content,
        updated_at: Date.now(),
      })
      .where(and(eq(posts.author_id, user_id), eq(posts.id, post.id)));
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

export async function dbDeletePost(post: post) {
  await db.delete(comments).where(eq(comments.post_id, post.id));
  await db.delete(likes).where(eq(likes.post_id, post.id));
  await db.delete(posts).where(eq(posts.id, post.id));
  return "Deleted";
}

// export async function nextPostPage(page: number, post_id: number) {
//   const pageSize = 15;
//   const offset = (page - 1) * pageSize;
//   return db.query.comments.findMany({
//     orderBy: desc(comments.created_at),
//     where: eq(comments.post_id, post_id),
//     offset: offset,
//     limit: pageSize,
//   });
// }

export async function nextHomePage(page: number, user_id?: number) {
  const pageSize = 30;
  const offset = (page - 1) * pageSize;
  if (user_id) {
    const user = await db.query.users.findFirst({where: eq(users.id, user_id)})
    if (user?.embedding) {
      return db.query.posts.findMany({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        orderBy: l2Distance(posts.embedding, user.embedding),
        limit: pageSize,
        offset: offset,
        columns: {
          embedding: false,
        },
        with: {
          author: true,
          comments: true,
          likes: true,
        },
      });
    }
  }
  return db.query.posts.findMany({
    orderBy: desc(posts.updated_at),
    limit: pageSize,
    offset: offset,
    columns: {
      embedding: false,
    },
    with: {
      author: true,
      comments: true,
      likes: true,
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
  console.log("updateProfile()");
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
  console.log(
    "createProfile called. Ideally this value is undefined because its a query for that clerk id: ",
    user,
  );
  if (!user) {
    console.log("Creating user");
    const newUser = await db.insert(users).values({
      clerk_id: profile.data.id,
      name: `${profile.data.first_name ? profile.data.first_name : "Unknown"} ${profile.data.last_name ? profile.data.last_name : ""} `,
      image_url: profile.data.image_url,
      recent_likes: []
    });
    console.log("Created user: ", newUser);
    return newUser;
  }
}

export async function deleteProfile(profile: profile) {
  console.log("deleteProfile()", profile.data.id);
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.clerk_id, profile.data.id),
  });
  if (user) {
    await db.delete(posts).where(eq(posts.author_id, user.id));
    await db.delete(comments).where(eq(comments.author_id, user.id));
    await db.delete(likes).where(eq(likes.user_id, user.id));
    await db
      .delete(follows)
      .where(
        or(
          eq(follows.user_id, user.id),
          eq(follows.following_user_id, user.id),
        ),
      );
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
  console.log(searchEmbedding);
  return db
    .select()
    .from(posts)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .orderBy(l2Distance(posts.embedding, searchEmbedding))
    .limit(15);
}

export async function updateUserEmbed(userId: string) {
  const user = await db.query.users.findFirst({where: eq(users.clerk_id, userId)})
  if (user) {
    console.log("Updating user embed")
    const embeddings = await getPostEmbeddings(user.recent_likes)
    const userEmbedding = await getAverageEmbedding(embeddings)
    await db.update(users)
      .set({
        embedding: userEmbedding
      })
      .where(and(eq(users.clerk_id, userId),eq(users.id, user.id)))
  }
}



// const embeddings = await getPostEmbeddings(newLikes)
// const userEmbedding = await getAverageEmbedding(embeddings)
//
// await ctx.db.update(users)
//   .set({
//     recent_likes: newLikes,
//     embedding: userEmbedding
//   })
//   .where(eq(users.id, user.id));





















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
  "When you realize you've been coding for 8 hours straight and forgot to eat lunch. Oops."
];




export async function seedData() {
  for (const content in tweets) {
    const embedding = await getEmbedding(content);
    void db.insert(posts)
      .values({
        author_id: 8,
        content: content,
        post_tags: "",
        image_urls: [],
        created_at: Date.now(),
        updated_at: Date.now(),
        embedding: embedding,
      })
  }
}