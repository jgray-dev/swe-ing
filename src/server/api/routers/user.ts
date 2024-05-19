import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ clerkId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(users).values({
        clerk_id: input.clerkId,
      });
    }),
});
