import { Request, Response, NextFunction } from "express";
import errorHandler from "../utils/error";
import Comment from "../models/comment.model";
import { AuthenticatedRequest } from "../utils/AuthenticatedRequest.types";
import {
  mapAllCommentsToResponse,
  mapCommentToResponse,
} from "../mappers/comment.mapper";

interface GetPostCommentsParams {
  postId: string;
}

interface GetPostCommentsQuery {
  startIndex?: string; // query params are always strings
}

interface CommentParams {
  commentId?: string;
}

// Create a comment
const createComment = async (
  req: AuthenticatedRequest<
    {},
    {},
    { content: string; userId: string; postId: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.id !== req.body.userId) {
      return next(errorHandler(403, "you are not allowed to post a comment"));
    }
    const newComment = new Comment({
      content: req.body.content,
      userId: req.body.userId,
      postId: req.body.postId,
    });
    await newComment.save();
    res.status(200).json(mapCommentToResponse(newComment));
  } catch (error) {
    next(error);
  }
};

// get all comments of a post
const getPostComments = async (
  req: Request<GetPostCommentsParams, {}, {}, GetPostCommentsQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const startIndex = req.query.startIndex
      ? parseInt(req.query.startIndex, 10)
      : 0;
    const comments = await Comment.find({
      postId: req.params.postId,
    })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(5);

    const commentsObj = comments.map((comments) => comments.toObject());

    const totalComments = await Comment.find({
      postId: req.params.postId,
    }).countDocuments();

    res
      .status(200)
      .json(mapAllCommentsToResponse({ comments: commentsObj, totalComments }));
  } catch (error) {
    next(error);
  }
};

// handle like/unlike a comment
const likeComment = async (
  req: AuthenticatedRequest<CommentParams, {}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    if (!req.user) {
      return next(errorHandler(404, "Unuthorized to like the comment"));
    }
    const currentUserId = req.user?.id;
    const likesAsStrings = comment.likes.map((like) => like.toString());
    const currentUserIndex = likesAsStrings.indexOf(currentUserId);
    // when current user has not liked the comment yet: like
    if (currentUserIndex === -1) {
      comment.numberOfLikes += 1;
      comment.likes.push(currentUserId as any);
    } else {
      // when cuurent user already liked the comment: unlike
      comment.numberOfLikes -= 1;
      comment.likes.splice(currentUserIndex, 1);
    }
    await comment.save();
    res.status(200).json(mapCommentToResponse(comment));
  } catch (error) {
    next(error);
  }
};

// delete a comment
const deleteComment = async (
  req: AuthenticatedRequest<CommentParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "comment not found"));
    }

    if (req.user?.id !== comment.userId.toString() && !req.user?.isAdmin) {
      return next(
        errorHandler(404, "You are not allowed to delete this comment.")
      );
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json("Comment has been deleted");
  } catch (error) {
    next(error);
  }
};

// edit a comment
const editComment = async (
  req: AuthenticatedRequest<CommentParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "comment not found"));
    }
    if (req.user?.id !== comment.userId.toString()) {
      return next(
        errorHandler(404, "You are not allowed to edit this comment.")
      );
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content,
      },

      { new: true }
    );
    if (!updatedComment) {
      return next(errorHandler(401, "Comment nout found"));
    }
    const updatedCommentObj = updatedComment?.toObject();
    res.status(200).json(mapCommentToResponse(updatedCommentObj));
  } catch (error) {
    next(error);
  }
};

export {
  createComment,
  getPostComments,
  likeComment,
  deleteComment,
  editComment,
};
