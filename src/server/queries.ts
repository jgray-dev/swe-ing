import "server-only";

import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";
import { posts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function getPosts() {
  console.log("getPosts (PLURAL)");
  return db.query.posts.findMany();
}

export async function getPost(id: number) {
  console.log("getPost (NOT PLURAL)");
  console.log("One");
  const user = auth();
  console.log("Two");

  if (!user.userId) throw new Error("Unauthorized");
  console.log("Three");

  return await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)
    .then((result) => result[0]);
}
