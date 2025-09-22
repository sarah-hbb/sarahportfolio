import { Router } from "express";

import {
  createComment,
  getPostComments,
  likeComment,
  deleteComment,
  editComment,
} from "../controllers/comment.controller";

import verifyToken from "../utils/verifyUser";

const router: Router = Router();

router.post("/create", verifyToken, createComment);
router.get("/getPostComments/:postId", getPostComments);
router.put("/likecomment/:commentId", verifyToken, likeComment);
router.delete("/deletecomment/:commentId", verifyToken, deleteComment);
router.put("/editcomment/:commentId", verifyToken, editComment);

export default router;
