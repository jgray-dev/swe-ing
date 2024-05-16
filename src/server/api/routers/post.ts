import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { posts } from "~/server/db/schema";
import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export const postApi = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        time: z.number(),
        content: z.string(),
        imageUrls: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = auth();
      console.log(user);
      if (!user.userId) throw new Error("UNAUTHORIZED");
      return db
        .insert(posts)
        .values({
          authorId: user.userId,
          content: input.content,
          imageUrls: input.imageUrls ?? null,
          created_at: input.time,
        })
        .returning();
    }),
  getSingle: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1)
        .then((result) => result[0]);
    }),
});
