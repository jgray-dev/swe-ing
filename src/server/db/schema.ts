import { sql } from "drizzle-orm";
import {
  pgTableCreator,
  serial,
  integer,
  varchar,
  text,
  bigint,
} from "drizzle-orm/pg-core";
export const createTable = pgTableCreator((name) => `swe-ing_${name}`);

export const users = createTable("users", {
  id: varchar("id", { length: 191 }).primaryKey().notNull(),
  bio: varchar("bio", { length: 255 }),
  location: varchar("location", { length: 255 }),
  website: varchar("website", { length: 255 }),
  skills: varchar("skills", { length: 255 }).array(),
});

export const posts = createTable("posts", {
  id: serial("id").primaryKey(),
  authorId: varchar("author_id", { length: 191 }).notNull(),
  content: varchar("content", { length: 255 }).notNull(),
  imageUrls: text("image_urls").$type<string[]>(),
  created_at: bigint("bigint", { mode: "number" }).notNull(),
});

export const comments = createTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  authorId: varchar("author_id", { length: 191 }).notNull(),
  content: varchar("content", { length: 255 }).notNull(),
  // created + updated timestamps
});

//1715880851
//1715880839
export const likes = createTable("likes", {
  userId: varchar("user_id", { length: 191 }).notNull(),
  postId: integer("post_id").notNull(),
  // created
});

export const follows = createTable("follows", {
  followingUserId: varchar("following_user_id", { length: 191 }).notNull(),
  followedUserId: varchar("followed_user_id", { length: 191 }).notNull(),
});

export const searches = createTable("searches", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 191 }).notNull(),
  search: varchar("search", { length: 255 }).notNull(),
});
