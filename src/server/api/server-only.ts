"use server";
import { env } from "~/env";
import "server-only";

import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

const index = pc.index(env.PINECONE_ENVIRONMENT);

export async function insertPinecone(
  table: string,
  embedding: number[],
  id: number,
) {
  return index.namespace(table).upsert([
    {
      id: `${id}`,
      values: embedding,
    },
  ]);
}

export async function embeddingFromID(table: string, queryID: number) {
  let validIds = [0];
  const tableIds = index.namespace(table);
  const results = await tableIds.listPaginated();
  if (results?.vectors) {
    validIds = results.vectors.map((vec) => Number(vec.id));
  }
  if (validIds.includes(queryID)) {
    const response = await index.namespace(table).query({
      topK: 1,
      id: `${queryID}`,
      includeValues: true,
    });
    if (response.matches.length > 0) {
      return response.matches[0]?.values;
    }
  } else {
    console.error(`User with ID ${queryID} not in ${table} in PCDB`);
  }
}

export async function searchPinecone(table: string, embedding: number[]) {
  const response = await index.namespace(table).query({
    topK: 500,
    vector: embedding,
    includeValues: false,
  });
  return response.matches.map((r) => r.id);
}
