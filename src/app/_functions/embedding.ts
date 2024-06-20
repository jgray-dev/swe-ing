"use server";

import { embeddingFromID } from "~/server/api/server-only";

import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: text,
    });
    return embedding;
  } catch (e) {
    console.error(e);
    return [];
  }
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
}
