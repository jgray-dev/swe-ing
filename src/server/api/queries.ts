"use server"

import {db} from "~/server/db";
import {posts} from "~/server/db/schema";
import {desc} from "drizzle-orm/sql/expressions/select";

export async function nextPostPage(page: number) {
  const pageSize = 2;
  const offset = (page - 1) * pageSize;
  return db
    .select()
    .from(posts)
    .orderBy(desc(posts.updated_at))
    .offset(offset)
    .limit(pageSize);
}
