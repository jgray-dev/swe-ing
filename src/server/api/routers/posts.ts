import { z } from "zod";

import {
  authedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";
import { desc } from "drizzle-orm/sql/expressions/select";

export const postsRouter = createTRPCRouter({
  create: authedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        imageUrls: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .insert(posts)
        .values({
          author_id: `${ctx.fullUser.id}`,
          author_name: `${ctx.fullUser.firstName} ${ctx.fullUser.lastName}`,
          author_url: `${ctx.fullUser.imageUrl?ctx.fullUser.imageUrl:"https://utfs.io/f/84653bfe-fa90-4a62-872d-7a9fc1ff1d08-jv4r0t.webp"}`,
          content: `${input.content}`,
          image_urls: input.imageUrls,
          created_at: Date.now(),
          updated_at: Date.now(),
        })
        .returning();
    }),
  getHomePage: authedProcedure
    .input(z.object({ page: z.number().min(1).default(1) }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * 50;
      return ctx.db.query.posts.findMany({
        orderBy: [desc(posts.updated_at)],
        limit: 50,
        offset: offset,
      });
    }),
  getSingle: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.posts.findFirst({
        where: (post, { eq }) => eq(post.id, input.id),
      });
    }),
});
