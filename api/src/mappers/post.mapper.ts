import { IPost } from "../models/post.model";
import {
  IPostResponse,
  IPostsResponse,
} from "../../../shared/types/post.types";

// Mapper functions to convert backend models to API response formats

interface IAllPosts {
  posts: IPost[];
  totalPosts?: number;
}

export const mapPostToResponse = (post: IPost): IPostResponse => {
  return {
    _id: post._id.toString(),
    userId: post.userId,
    title: post.title,
    content: post.content,
    image: post.image,
    category: post.category,
    slug: post.slug,
    bookmarks: post.bookmarks.map((bookmark) => bookmark.toString()),
    numberOfBookmarks: post.numberOfBookmarks,
    createdAt: post.createdAt?.toISOString() || "",
    updatedAt: post.updatedAt?.toISOString() || "",
  };
};

export const mapAllPostsToResponse = (allPosts: IAllPosts): IPostsResponse => {
  return {
    posts: allPosts.posts.map((post) => mapPostToResponse(post)),
    totalPosts: allPosts.totalPosts,
  };
};
