import { eq } from "drizzle-orm/sql/expressions/conditions";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const usersRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        clerkId: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        imageUrl: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(users).values({
        clerk_id: input.clerkId,
        name: `${input.firstName ? input.firstName : "Unknown"} ${input.lastName ? input.lastName : ""}`,
        image_url: input.imageUrl,
      });
    }),
});
