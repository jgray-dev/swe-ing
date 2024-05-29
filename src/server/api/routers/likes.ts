import { authedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";
import { likes, users } from "~/server/db/schema";
import { and, eq } from "drizzle-orm/sql/expressions/conditions";
import { updateUserEmbed } from "~/server/api/queries";

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

      if (user) {
        const previousLike = await ctx.db.query.likes.findFirst({
          where: and(
            eq(likes.post_id, input.post_id),
            eq(likes.user_id, user.id),
          ),
        });

        if (previousLike) {
          // Unlike the post
          const newLikes = (user.recent_likes ?? []).filter(
            (id) => id !== input.post_id,
          );
          await ctx.db
            .delete(likes)
            .where(
              and(eq(likes.post_id, input.post_id), eq(likes.user_id, user.id)),
            );
          await ctx.db
            .update(users)
            .set({
              recent_likes: newLikes,
            })
            .where(eq(users.id, user.id));
          return "Unliked";
        }
        // Like the post
        const newLikes = [input.post_id, ...(user.recent_likes ?? [])];
        const recentLikes = newLikes.slice(0, 10);
        await ctx.db.insert(likes).values({
          user_id: user.id,
          post_id: input.post_id,
        });
        await ctx.db
          .update(users)
          .set({
            recent_likes: recentLikes,
          })
          .where(eq(users.id, user.id));
        return "Liked";
      } else {
        return "NO USER";
      }
    }),
});
