import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { posts } from "~/server/db/schema";
import { db } from "~/server/db";
import {auth, clerkClient} from "@clerk/nextjs/server";
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
      if (!user.userId) throw new Error("UNAUTHORIZED");
      const profile = await clerkClient.users.getUser(user.userId)
      console.log("CLERK PROFILE: ", profile)
      return db
        .insert(posts)
        .values({
          author_id: user.userId,
          author_name: `${profile.firstName} ${profile.lastName}`,
          content: input.content,
          image_urls: input.imageUrls ?? null,
          created_at: input.time,
        })
        .returning();
    }),
  getSingle: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1)
        .then((result) => result[0]);
    }),
});
