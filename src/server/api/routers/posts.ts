import { z } from "zod";

import {
  authedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";
import { desc } from "drizzle-orm/sql/expressions/select";
import {getEmbedding} from "~/app/_components/embedding";

export const postsRouter = createTRPCRouter({
  create: authedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        imageUrls: z.array(z.string()).optional(),
        tags: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (user, { eq }) => eq(user.clerk_id, ctx.fullUser.id),
      });
      if (user) {
        const embedding = await getEmbedding(input.content)
        console.log(embedding)
        return ctx.db
          .insert(posts)
          .values({
            author_id: user.id,
            content: `${input.content}`,
            post_tags: `${input.tags ? input.tags : ""}`,
            image_urls: input.imageUrls,
            created_at: Date.now(),
            updated_at: Date.now(),
            embedding: embedding,
          })
          .returning();
      } else {
        return null;
      }
    }),
  getHomePage: publicProcedure
    .input(z.object({ page: z.number().min(1).default(1) }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * 50;
      return ctx.db.query.posts.findMany({
        orderBy: [desc(posts.updated_at)],
        with: {
          embedding: false,
        },
        limit: 50,
        offset: offset,
      });
    }),
  getSingle: authedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.posts.findFirst({
        where: (post, { eq }) => eq(post.id, input.id),
        with: {
          likes: true,
          comments: true,
          author: true,
        },
      });
    }),
});
