import "server-only";

import { db } from "~/server/db";
import { posts } from "~/server/db/schema";

export async function getPosts(page: number) {
  return db
    .select()
    .from(posts)
    .offset((page - 1) * 50)
    .limit(50);
}
