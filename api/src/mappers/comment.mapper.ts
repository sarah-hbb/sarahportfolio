import { IComment } from "../models/comment.model";
import {
  ICommentResponse,
  ICommentsResponse,
} from "../../../shared/types/comment.types";

interface IAllComments {
  comments: IComment[];
  totalComments: number;
}

export const mapCommentToResponse = (comment: IComment): ICommentResponse => {
  return {
    _id: comment._id.toString(),
    postId: comment.postId.toString(),
    userId: comment.userId.toString(),
    content: comment.content,
    likes: comment.likes.map((like) => like.toString()),
    numberOfLikes: comment.numberOfLikes,
    createdAt: comment.createdAt?.toISOString() || "",
    updatedAt: comment.updatedAt?.toISOString() || "",
  };
};

export const mapAllCommentsToResponse = (
  allComments: IAllComments
): ICommentsResponse => {
  return {
    comments: allComments.comments.map((comment) =>
      mapCommentToResponse(comment)
    ),
    totalComments: allComments.totalComments,
  };
};
