import { postApi } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  post: postApi,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
