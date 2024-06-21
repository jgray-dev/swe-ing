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

export interface post {
  id: number;
  author_id: number;
  content: string;
  image_urls: string;
  post_tags: string;
  created_at: number;
  updated_at: number;
  generalized: string | null;
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
    permission: number;
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
  permission: number;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string;
  recent_likes?: number[];
}
