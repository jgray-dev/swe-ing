import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const authedProcedure = t.procedure.use(async function isAuthed(opts) {
  let user = undefined;
  try {
    user = auth();
    const fullUser = await clerkClient.users.getUser(`${user.userId}`);
    return opts.next({
      ctx: {
        user: user,
        fullUser: fullUser,
      },
    });
  } catch {
    console.error("Error getting user from Clerk");
    throw new Error("Error getting user from Clerk");
  }
});
