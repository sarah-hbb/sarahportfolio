export interface ICommentResponse {
  _id: string; // ObjectId → string
  postId: string; // ObjectId → string
  userId: string; // ObjectId → string
  content: string;
  likes: string[]; // array of User IDs as strings
  numberOfLikes: number;
  createdAt?: string; // Date → ISO string
  updatedAt?: string; // Date → ISO string
}

export interface ICommentsResponse {
  comments: ICommentResponse[];
  totalComments: number;
}
