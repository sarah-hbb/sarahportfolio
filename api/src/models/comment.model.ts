import { Schema, model, Document, Types } from "mongoose";

// Backend-only Comment interface
export interface IComment extends Document {
  _id: Types.ObjectId;
  postId: Types.ObjectId; // reference to Post
  userId: Types.ObjectId; // reference to User
  content: string;
  likes: Types.ObjectId[]; // array of User IDs
  numberOfLikes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema = new Schema(
  {
    postId: {
      type: Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: {
      type: [{ type: Types.ObjectId, ref: "User" }],
      default: [],
    },
    numberOfLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Comment = model<IComment>("Comment", commentSchema);

export default Comment;
