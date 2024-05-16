import { sql } from "drizzle-orm";
import {
  pgTableCreator,
  serial,
  integer,
  varchar,
  timestamp,
  text,
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
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const comments = createTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  authorId: varchar("author_id", { length: 191 }).notNull(),
  content: varchar("content", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const likes = createTable("likes", {
  userId: varchar("user_id", { length: 191 }).notNull(),
  postId: integer("post_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
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
