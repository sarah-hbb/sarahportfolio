import errorHandler from "../utils/error";
import Post from "../models/post.model";
import { AuthenticatedRequest } from "../utils/AuthenticatedRequest.types";
import { Response, NextFunction } from "express";
import { PostCategory } from "../../../shared/enums";
import {
  mapAllPostsToResponse,
  mapPostToResponse,
} from "../mappers/post.mapper";

interface GetPostQuery {
  startIndex?: string;
  limit?: string;
  order?: string;
  category?: PostCategory;
  userId?: string;
  slug: string;
  postId: string;
  searchTerm: string;
}

interface PostParams {
  postId?: string;
  userId?: string;
}

interface OnlyUserIdParams {
  userId?: string;
}

// Create a post
const create = async (
  req: AuthenticatedRequest<{}, {}, { title: string; content: string }>,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    return next(errorHandler(403, "You are not allowed to create a post"));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "Please provide all required fields"));
  }
  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");

  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(mapPostToResponse(savedPost));
  } catch (error) {
    next(error);
  }
};

// Get post (all posts or just one specific post)
const getPosts = async (
  req: AuthenticatedRequest<{}, {}, {}, GetPostQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const startIndex = req.query.startIndex
      ? parseInt(req.query.startIndex)
      : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.find({
      createdAt: { $gte: oneMonthAgo },
    });

    const lastMonthPostsCount = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res
      .status(200)
      .json({ posts, lastMonthPosts, lastMonthPostsCount, totalPosts });
  } catch (error) {
    next(error);
  }
};

// Delete post
const deletepost = async (
  req: AuthenticatedRequest<PostParams>,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete this post"));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json("the post has been deleted");
  } catch (error) {
    next(error);
  }
};

// Update post
const updatepost = async (
  req: AuthenticatedRequest<PostParams>,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin || req.user.id !== req.params.userId)
    return next(errorHandler(403, "You are not allowed to update this post"));
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },
      { new: true }
    );
    if (!updatedPost) {
      return next(errorHandler(401, "Post not found"));
    }
    res.status(200).json(mapPostToResponse(updatedPost.toObject()));
  } catch (error) {
    next(error);
  }
};

// Bookmark/unbookmark a post
const bookmarkPost = async (
  req: AuthenticatedRequest<PostParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return next(errorHandler(404, "post not found!"));
    }
    const currentUserId = req.user?.id;
    const bookmarksAsStrings = post.bookmarks.map((bookmark) =>
      bookmark.toString()
    );
    if (!req.user) {
      return next(errorHandler(401, "Post not found"));
    }
    const currentUserIndex = bookmarksAsStrings.indexOf(req.user.id);
    if (currentUserIndex === -1) {
      post.bookmarks.push(currentUserId as any);
      post.numberOfBookmarks += 1;
    } else {
      post.bookmarks.splice(currentUserIndex, 1);
      post.numberOfBookmarks -= 1;
    }

    await post.save();

    res.status(200).json(mapPostToResponse(post));
  } catch (error) {
    next(error);
  }
};

// get the bookmarks for a user
const getMyBookmarks = async (
  req: AuthenticatedRequest<OnlyUserIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.id !== req.params.userId) {
      return next(errorHandler(403, "You are unauthorized to see bookmarks"));
    }
    const bookmarkedPosts = await Post.find({
      bookmarks: { $in: [req.params.userId] },
    });
    const bookmarkedPostsObj = bookmarkedPosts.map((bookmarkedPost) =>
      bookmarkedPost.toObject()
    );
    res.status(200).json(mapAllPostsToResponse({ posts: bookmarkedPostsObj }));
  } catch (error) {
    next(error);
  }
};

export {
  create,
  getPosts,
  deletepost,
  updatepost,
  bookmarkPost,
  getMyBookmarks,
};
