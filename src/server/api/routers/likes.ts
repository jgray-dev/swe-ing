import { authedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";
import {likes, users} from "~/server/db/schema";
import { and, eq } from "drizzle-orm/sql/expressions/conditions";
import {getAverageEmbedding, getPostEmbeddings, getUserEmbedding} from "~/app/_components/embedding";

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
          const newLikes = (user.recent_likes ?? []).filter(id => id !== input.post_id);

          await ctx.db.update(users)
            .set({
              recent_likes: newLikes,
            })
            .where(eq(users.id, user.id));

          await ctx.db
            .delete(likes)
            .where(
              and(eq(likes.post_id, input.post_id), eq(likes.user_id, user.id)),
            );
          // void getUserEmbedding(user as user)
          const embeddings = getPostEmbeddings(newLikes)
          return "Unliked";
        }

        // Add the new like to the recent_likes array
        const newLikes = [input.post_id, ...(user.recent_likes ?? [])];

        // Keep only the most recent 50 likes
        const recentLikes = newLikes.slice(0, 5);


        await ctx.db.insert(likes).values({
          user_id: user.id,
          post_id: input.post_id,
        });
        const embeddings = await getPostEmbeddings(recentLikes)
        const userEmbedding = await getAverageEmbedding(embeddings)

        await ctx.db.update(users)
          .set({
            recent_likes: recentLikes,
            embedding: userEmbedding
          })
          .where(eq(users.id, user.id));
        // void getUserEmbedding(user as user)
        return "Liked";
      } else {
        return "NO USER";
      }
    }),
});

