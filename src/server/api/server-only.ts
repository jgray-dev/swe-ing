"use server";
import { env } from "~/env";
import "server-only";

import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

const index = pc.Index(env.PINECONE_ENVIRONMENT);

export async function pineconeDelete(
  ids: number[],
  table: string,
) {
  const ns = index.namespace(table)
  void await ns.deleteMany(ids.map((id)=>String(id)))
  return "Deleted"
}

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
    const response = await index.namespace(table).query({
      topK: 1,
      id: `${queryID}`,
      includeValues: true,
    });
    if (response.matches.length > 0) {
      return response.matches[0]?.values;
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
