"use server";

import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { embeddingFromID } from "~/server/api/server-only";

export async function getEmbedding(text: string, tags?: string) {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text + tags,
  });
  return embedding;
}

export async function getAverageEmbedding(
  embeddings1: number[],
  weight1: number,
  embeddings2: number[][],
  weight2: number,
) {
  const average: number[] = [];
  const totalWeight = weight1 + weight2;
  for (let i = 0; i < 1536; i++) {
    let weightedSum = 0;
    if (embeddings1[i] !== undefined) {
      // @ts-expect-error fts
      weightedSum += embeddings1[i] * weight1;
    }
    for (const item of embeddings2) {
      if (item[i] !== undefined) {
        // @ts-expect-error fts
        weightedSum += item[i] * (weight2 / embeddings2.length);
      }
    }
    average[i] = weightedSum / totalWeight;
  }
  // console.log(average)
  return average;
}

//Take an array of Post ID's, and return an array of the embeddings (number[][])
export async function getPostEmbeddings(postIds: number[]) {
  if (postIds.length === 0) {
    return [];
  }
  const allEmbeds = [];
  for (const id of postIds) {
    const idValue = await embeddingFromID("posts", id);
    if (idValue) {
      allEmbeds.push(idValue);
    }
  }
  return allEmbeds;

  // Pre-PC code
  // const allPosts = await db.query.posts.findMany({
  //   where: (post) => inArray(post.id, postIds),
  //   columns: {
  //     embedding: true,
  //   },
  // });
  // const returnList: number[][] = [];
  // // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  // allPosts.forEach((post) => returnList.push(post.embedding));
  // return returnList;
}
