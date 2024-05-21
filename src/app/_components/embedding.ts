"use server"

import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import {db} from "~/server/db";
import {posts} from "~/server/db/schema";

export async function getEmbedding(text:string){
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  return embedding
}
