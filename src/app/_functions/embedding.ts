"use server";

import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "~/server/db";
import { inArray } from "drizzle-orm/sql/expressions/conditions";
import {embeddingFromID} from "~/server/api/server-only";

export async function getEmbedding(text: string, tags?: string) {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text + tags,
  });
  return embedding;
}

export async function getAverageEmbedding(embeddings: number[][]) {
  const average: number[] = [];
  for (let i = 0; i < 1536; i++) {
    let sum = 0;
    let count = 0;
    
    for (const item of embeddings) {
      if (item[i] !== undefined) {
        // @ts-expect-error fuck typescript
        sum += item[i];
        count++;
      }
    }
    average[i] = count > 0 ? sum / count : 0;
  }
  return average;
}

//Take an array of Post ID's, and return an array of the embeddings (number[][])
export async function getPostEmbeddings(postIds: number[]) {
  console.log("getPostEmbeddings(", postIds, ")")
  if (postIds.length === 0) {
    return [];
  }
  
  const allEmbeds = []
  for (const id of postIds) {
    const idValue = await embeddingFromID("posts", id);
    if (idValue) {
      allEmbeds.push(idValue)
    }
  }
  return allEmbeds
  
  
  
  
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
