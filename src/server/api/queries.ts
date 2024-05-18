"use server"

import {db} from "~/server/db";
import {posts} from "~/server/db/schema";
import {desc} from "drizzle-orm/sql/expressions/select";
import {clerkClient} from "@clerk/nextjs/server";

export async function nextPostPage(page: number) {
  const pageSize = 5;
  const offset = (page - 1) * pageSize;
  return db
    .select()
    .from(posts)
    .orderBy(desc(posts.updated_at))
    .offset(offset)
    .limit(pageSize);
}


export async function getProfilePic(userId: string) {
  const profile = await clerkClient.users.getUser(userId)
  if (profile) {
    if (profile.hasImage) {
      return profile.imageUrl
    } else {
      return null
    }
  } else {
    return null
  }
}