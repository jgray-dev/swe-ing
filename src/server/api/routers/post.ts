import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { posts } from "~/server/db/schema";
import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";

export const postApi = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        content: z.string(),
        imageUrls: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = auth();

      if (!user.userId) throw new Error("UNAUTHORIZED");

      console.log("USER: ", user);

      await db.insert(posts).values({
        authorId: user.userId,
        content: input.content,
        imageUrls: input.imageUrls ?? null,
      });
    }),
});
