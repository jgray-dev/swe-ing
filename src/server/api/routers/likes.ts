import { authedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";
import { likes } from "~/server/db/schema";
import { and, eq } from "drizzle-orm/sql/expressions/conditions";

export const likesRouter = createTRPCRouter({
  create: authedProcedure
    .input(
      z.object({
        post_id: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (user, { eq }) => eq(user.clerk_id, ctx.fullUser.id),
      });
      console.log(ctx.fullUser.id);
      if (user) {
        const previousLike = await ctx.db.query.likes.findFirst({
          where: and(
            eq(likes.post_id, input.post_id),
            eq(likes.user_id, user.id),
          ),
        });
        if (previousLike) {
          await ctx.db
            .delete(likes)
            .where(
              and(eq(likes.post_id, input.post_id), eq(likes.user_id, user.id)),
            );
          return "Unliked";
        }
        await ctx.db.insert(likes).values({
          user_id: user.id,
          post_id: input.post_id,
        });
        return "Liked";
      } else {
        return "NO USER";
      }
    }),
});
