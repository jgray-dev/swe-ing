import "server-only";

import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { posts } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function getPosts() {
  return db.query.posts.findMany();
}

export async function getPost(id: number) {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  return await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)
    .then((result) => result[0]);
}

export async function createPost(content: string, imageUrls: string[]) {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  await db.insert(posts).values({
    authorId: user.userId,
    content: content,
    imageUrls: imageUrls,
  });
}
