import { z } from "zod";

import { authedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { comments, posts, users } from "~/server/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export const commentsRouter = createTRPCRouter({
  create: authedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        post_id: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (user, { eq }) => eq(user.clerk_id, ctx.fullUser.id),
      });
      if (user) {
        await ctx.db
          .update(posts)
          .set({
            updated_at: Date.now(),
          })
          .where(eq(posts.id, input.post_id));
        return ctx.db
          .insert(comments)
          .values({
            post_id: input.post_id,
            author_id: user.id,
            content: input.content,
            created_at: Date.now(),
          })
          .returning();
      } else {
        return null;
      }
    }),
});
