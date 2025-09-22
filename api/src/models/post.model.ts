import { Schema, model, Document, Types } from "mongoose";

// Backend-only User interface (Mongoose model)
export interface IPost extends Document {
  _id: Types.ObjectId; // Explicit ObjectId for clarity
  userId: string;
  content: string;
  title: string;
  image?: string;
  category?: string;
  slug: string;
  bookmarks: Types.ObjectId[];
  numberOfBookmarks: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const postSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default:
        "https://www.shutterstock.com/shutterstock/photos/551729392/display_1500/stock-photo-technology-concept-banner-blog-551729392.jpg",
    },
    category: {
      type: String,
      default: "uncategorized",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    bookmarks: {
      type: [{ type: Types.ObjectId, ref: "User" }],
      default: [],
    },
    numberOfBookmarks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Post = model<IPost>("Post", postSchema);

export default Post;
