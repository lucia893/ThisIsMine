export interface Post {
  id: string;
  title: string;
  description: string;
  category: "lost" | "found";
  image?: string;
  location?: string;
  datePosted: string;
  contact?: string;
}

export interface PostRow {
  id: string;
  title: string;
  description: string;
  category: "lost" | "found";
  image_url: string | null;
  image_key: string | null;
  location: string;
  date_posted: Date | string;
  contact: string;
}
