"use server"

import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import {db} from "~/server/db";
import {embeddings} from "~/server/db/schema";

export async function insertEmbeddingWithPost(text: string, post_id: number) {
  console.log(post_id, text)
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  await db.insert(embeddings).values({
    post_id: post_id,
    embedding: embedding
  })
}


export async function getEmbedding(text:string){
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  return embedding
}
