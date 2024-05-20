"use server";

import { db } from "~/server/db";
import { posts } from "~/server/db/schema";
import { desc } from "drizzle-orm/sql/expressions/select";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import type {profile} from "~/app/_components/interfaces"

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


export async function updateProfile(profile: profile) {
  console.log("updateProfile()")
  return db
    .update(posts)
    .set({
      author_url: `${profile.data.image_url}`,
      author_name: `${profile.data.first_name ? profile.data.first_name : "Unknown"} ${profile.data.last_name ? profile.data.last_name : ""} `,
    })
    .where(eq(posts.author_id, profile.data.id))
    .returning();
}

export async function createProfile(profile: profile) {
  console.log("createProfile()");
}
export async function deleteProfile(profile: profile) {
  console.log("deleteProfile()");
}
