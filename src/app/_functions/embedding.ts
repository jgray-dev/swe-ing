"use server";

import { embeddingFromID } from "~/server/api/server-only";
import type { Response } from "~/app/_functions/interfaces";

export async function getEmbedding(
  text: string,
  tags?: string,
): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;

  try {
    const response = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: `${text} ${tags}`,
        model: "voyage-large-2",
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: Response = await response.json();
    if (data.data[0]?.embedding) {
      return data.data[0].embedding;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error:", error);
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
