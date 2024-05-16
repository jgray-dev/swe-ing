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
  author_id: varchar("author_id", { length: 191 }).notNull(),
  content: varchar("content", { length: 255 }).notNull(),
  image_urls: text("image_urls").$type<string[]>(),
  created_at: bigint("created_at", { mode: "number" }).notNull(),
});

export const comments = createTable("comments", {
  id: serial("id").primaryKey(),
  post_id: integer("post_id").notNull(),
  author_id: varchar("author_id", { length: 191 }).notNull(),
  content: varchar("content", { length: 255 }).notNull(),
  created_at: bigint("created_at", { mode: "number" }).notNull(),
  updated_at: bigint("updated_at", { mode: "number" }).notNull(),
});

export const likes = createTable("likes", {
  user_id: varchar("user_id", { length: 191 }).notNull(),
  post_id: integer("post_id").notNull(),
});

// If jackson follows Sabrina, jackson is user_id, and sabrina is following_user_id
export const follows = createTable("follows", {
  user_id: varchar("user_id", { length: 191 }).notNull(),
  following_user_id: varchar("following_user_id", { length: 191 }).notNull(),
});

export const searches = createTable("searches", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 191 }).notNull(),
  searches: text("searches").$type<string[]>(),
});
