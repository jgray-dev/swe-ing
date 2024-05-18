import {
  pgTableCreator,
  serial,
  integer,
  varchar,
  text,
  bigint,
} from "drizzle-orm/pg-core";
export const createTable = pgTableCreator((name) => `sweing_${name}`);

export const users = createTable("users", {
  id: serial("id").primaryKey().notNull(),
  clerk_id: varchar("clerk_id", { length: 191 }).notNull(),
  bio: varchar("bio", { length: 255 }),
  location: varchar("location", { length: 255 }),
  website: varchar("website", { length: 255 }),
  skills: varchar("skills", { length: 255 }).array().default([]),
  following: varchar("following").array().default([]),
});

export const posts = createTable("posts", {
  id: serial("id").primaryKey().notNull(),
  author_id: varchar("author_id", { length: 191 }).notNull(),
  author_name: varchar("author_name", { length: 191 }).notNull(),
  author_url: varchar("author_url", { length: 191 }).notNull(),
  content: varchar("content", { length: 255 }).notNull(),
  image_urls: text("image_urls").$type<string[]>(),
  post_tags: text("post_tags").$type<string[]>(),
  created_at: bigint("created_at", { mode: "number" }).notNull(),
  updated_at: bigint("updated_at", { mode: "number" }).notNull(),
});

export const comments = createTable("comments", {
  id: serial("id").primaryKey().notNull(),
  post_id: integer("post_id").notNull(),
  author_id: varchar("author_id", { length: 191 }).notNull(),
  content: varchar("content", { length: 255 }).notNull(),
  created_at: bigint("created_at", { mode: "number" }).notNull(),
  updated_at: bigint("updated_at", { mode: "number" }).notNull(),
});

export const likes = createTable("likes", {
  id: serial("id").primaryKey().notNull(),
  user_id: varchar("user_id", { length: 191 }).notNull(),
  post_id: integer("post_id").notNull(),
});

export const follows = createTable("follows", {
  id: serial("id").primaryKey().notNull(),
  user_id: varchar("user_id", { length: 191 }).notNull(),
  following_user_id: varchar("following_user_id", { length: 191 }).notNull(),
});

export const searches = createTable("searches", {
  id: serial("id").primaryKey().notNull(),
  user_id: varchar("user_id", { length: 191 }).notNull(),
  searches: text("searches").$type<string[]>(),
});