import { z } from "zod";

import {authedProcedure, createTRPCRouter, publicProcedure} from "~/server/api/trpc";
import {posts} from "~/server/db/schema";
import {eq} from "drizzle-orm/sql/expressions/conditions";

export const postsRouter = createTRPCRouter({
  create: authedProcedure
    .input(z.object({ content: z.string().min(1),
      imageUrls: z.array(z.string()).optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(posts).values({
        author_id: `${ctx.fullUser.id}`,
        author_name: `${ctx.fullUser.firstName} ${ctx.fullUser.lastName}`,
        content: `${input.content}`,
        image_urls: input.imageUrls,
        created_at: Date.now(),
        updated_at: Date.now(),
      }).returning();
    }),
  getHomePage: authedProcedure
    .input(z.object({ page: z.number().min(1).default(1) }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * 25;
      return ctx.db
        .select()
        .from(posts)
        .orderBy(posts.updated_at)
        .limit(25)
        .offset(offset);
    }),
  
  getSingle: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1)
        .then((result) => result[0]);
    }),
});
