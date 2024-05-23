"use server";
import "server-only";

import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: "5b4aa784-3c60-4fa1-b327-f1297a490327",
});

const index = pc.index("sweing");

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
