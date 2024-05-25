import {
  pgTableCreator,
  serial,
  integer,
  varchar,
  text,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const createTable = pgTableCreator((name) => `sweing_${name}`);

export const users = createTable("users", {
  id: serial("id").primaryKey().notNull(),
  clerk_id: varchar("clerk_id", { length: 191 }).notNull(),
  name: varchar("name", { length: 191 }).notNull(),
  image_url: varchar("image_url", { length: 191 }).notNull(),
  bio: varchar("bio", { length: 255 }),
  location: varchar("location", { length: 255 }),
  website: varchar("website", { length: 255 }),
  skills: varchar("skills"),
  recent_likes: integer("recent_likes").array().notNull(),
});

export const posts = createTable("posts", {
  id: serial("id").primaryKey().notNull(),
  author_id: integer("author_id").notNull().default(0),
  content: varchar("content", { length: 750 }).notNull(),
  image_urls: text("image_urls").$type<string[]>(),
  post_tags: varchar("post_tags").notNull().default(""),
  created_at: bigint("created_at", { mode: "number" }).notNull(),
  updated_at: bigint("updated_at", { mode: "number" }).notNull(),
});


export const comments = createTable("comments", {
  id: serial("id").primaryKey().notNull(),
  parent_id: integer("parent_id").notNull().references(() => posts.id),
  child_id: integer("child_id").notNull().references(() => posts.id),
});

export const likes = createTable("likes", {
  id: serial("id").primaryKey().notNull(),
  user_id: integer("user_id").notNull().default(0),
  post_id: integer("post_id").notNull().default(0),
});

export const follows = createTable("follows", {
  id: serial("id").primaryKey().notNull(),
  user_id: integer("user_id").notNull().default(0),
  following_user_id: integer("following_user_id").notNull().default(0),
});

export const reports = createTable("reports", {
  id: serial("id").primaryKey().notNull(),
  post_id: bigint("post_id", { mode: "number" }).notNull(),
  reporter_id: bigint("reporter_id", { mode: "number" }).notNull(),
  reported_at: bigint("reported_at", { mode: "number" }).notNull(),
});


// Relationships:

// Give every post multiple comments/likes
export const postCommentRelations = relations(posts, ({ many }) => ({
  children: many(comments),
  parents: many(comments),
  likes: many(likes),
}));

export const postsToComments = relations(comments, ({ one }) => ({
  follower: one(users, {
    fields: [comments.followerId],
    references: [users.id],
  }),
  following: one(users, {
    fields: [usersToUsers.followingId],
    references: [users.id],
  }),
}));


//Give every comment a single post
export const commentPostRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.post_id],
    references: [posts.id],
  }),
}));

// Give every "like" a single post
export const likePostRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.post_id],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [likes.user_id],
    references: [users.id],
  }),
}));

// Give every "follow" a user and a following user
export const followRelations = relations(follows, ({ one }) => ({
  user: one(users, {
    fields: [follows.user_id],
    references: [users.id],
  }),
  following_user: one(users, {
    fields: [follows.following_user_id],
    references: [users.id],
  }),
}));

// Give every "post" a single author
export const postAuthorRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.author_id],
    references: [users.id],
  }),
}));

// Give every "comment" a single author
export const commentAuthorRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.author_id],
    references: [users.id],
  }),
}));

// Give every user multiple posts
export const authorPostRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));
