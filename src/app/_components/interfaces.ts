export interface profile {
  data: {
    image_url: string;
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  type: string;
}


export interface Post {
  id: number;
  author_id: string;
  author_name: string;
  author_url: string;
  content: string;
  image_urls: string[] | null;
  post_tags: string;
  created_at: number;
  updated_at: number;
}