// Post response interface (for API responses) to use it in frontend

export interface IPostResponse {
  _id: string; // ObjectId → string
  userId: string;
  content: string;
  title: string;
  image?: string;
  category?: string;
  slug: string;
  bookmarks: string[];
  numberOfBookmarks: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPostsResponse {
  posts: IPostResponse[];
  totalPosts?: number;
}
