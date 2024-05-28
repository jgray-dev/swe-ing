import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { usersRouter } from "~/server/api/routers/user";
import { postsRouter } from "~/server/api/routers/posts";
import { likesRouter } from "~/server/api/routers/likes";
import {commentsRouter} from "~/server/api/routers/comments";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: usersRouter,
  posts: postsRouter,
  likes: likesRouter,
  comments: commentsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
