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
