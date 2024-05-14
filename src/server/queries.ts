import "server-only";
import { db } from "./db";

export async function getPosts() {
  return db.query.posts.findMany();
}
