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
  comments?: string[]
  likes?: string[]
}
