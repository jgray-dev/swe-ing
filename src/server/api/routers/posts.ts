import { z } from "zod";

import {authedProcedure, createTRPCRouter} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const postsRouter = createTRPCRouter({
  create: authedProcedure
    .input(z.object({ content: z.string().min(1),
      imageUrls: z.array(z.string()).optional() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        author_id: `${ctx.fullUser.id}`,
        author_name: `${ctx.fullUser.firstName} ${ctx.fullUser.lastName}`,
        content: `${input.content}`,
        image_urls: input.imageUrls,
        created_at: Date.now(),
      });
    }),
});
