export interface webhookRequest {
  data: {
    image_url: string;
    id: string;
    first_name?: string;
    last_name?: string;
    user_id?: string;
  };
  object: string;
  type: string;
}

export interface profile {
  data: {
    image_url: string;
    id: string;
    first_name?: string;
    last_name?: string;
    user_id?: string;
  };
  type: string;
}

export interface post {
  id: number;
  author_id: number;
  content: string;
  image_urls: string;
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

export interface like {
  post_id: number;
  user_id: number;
}

export interface comment {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  created_at: number;
  author: {
    id: number;
    image_url: string;
    name: string;
  };
}

export interface user {
  id: number;
  clerk_id: string;
  name: string;
  image_url: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string;
  recent_likes?: number[];
}

// Embeddings interfaces
interface Embedding {
  object: string;
  embedding: number[];
  index: number;
}

interface Usage {
  total_tokens: number;
}

export interface Response {
  object: string;
  data: Embedding[];
  model: string;
  usage: Usage;
}
