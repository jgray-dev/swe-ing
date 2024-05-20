"use server";

import { db } from "~/server/db";
import { comments, follows, likes, posts, users } from "~/server/db/schema";
import { desc } from "drizzle-orm/sql/expressions/select";
import { eq, or } from "drizzle-orm/sql/expressions/conditions";
import type { post, profile } from "~/app/_components/interfaces";

export async function nextPostPage(page: number) {
  const pageSize = 15;
  const offset = (page - 1) * pageSize;

  return db.query.posts.findMany({
    orderBy: desc(posts.updated_at),
    limit: pageSize,
    offset: offset,
    with: {
      author: true,
    },
  });
}

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
    });
    console.log("Created user: ", newUser);
    return newUser;
  }
}

// export async function deleteProfile(profile: profile) {
//   console.log("deleteProfile()", profile.data.id);
// const deletedPosts: post[] = await db
//   .delete(posts)
//   .where(eq(posts.author, profile.data.id)).returning();
//
// for (const post of deletedPosts) {
//   void await deletePost(post)
// }
// await db.delete(users)
//   .where(eq(users.clerk_id, profile.data.id));
// await db
//   .delete(users)
//   .where(eq(users.clerk_id, profile.data.id))
// await db
//   .delete(comments)
//   .where(eq(comments.author_id, profile.data.id))
// await db
//   .delete(likes)
//   .where(eq(likes.user_id, profile.data.id))
// await db
//   .delete(follows)
//   .where(or(eq(follows.user_id, profile.data.id),eq(follows.following_user_id, profile.data.id)))
// }

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
