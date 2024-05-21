import { bigint, integer, serial, varchar } from "drizzle-orm/pg-core";

export interface profile {
  data: {
    image_url: string;
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  type: string;
}

export interface post {
  id: number;
  author_id: number;
  content: string;
  image_urls: string[] | null;
  post_tags: string;
  created_at: number;
  updated_at: number;
  comments?: string[];
  likes?: like[];
  author?: {
    id: number;
    clerk_id: string;
    name: string;
    image_url: string;
    bio: string;
    location: string;
    website: string;
    skills: string;
  };
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface like {
  post_id: number;
  user_id: number;
}

export interface comment {
  post_id: number;
  author_id: number;
  content: string;
  created_at: number;
  author?: user;
}

export interface user {
  id?: number;
  clerk_id: string;
  name: string;
  image_url: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string;
}
