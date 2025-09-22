import { Router } from "express";
import {
  create,
  getPosts,
  deletepost,
  updatepost,
  bookmarkPost,
  getMyBookmarks,
} from "../controllers/post.controller";
import verifyToken from "../utils/verifyUser";

const router: Router = Router();

router.post("/create", verifyToken, create);
router.get("/getposts", getPosts);
router.delete("/deletepost/:postId/:userId", verifyToken, deletepost);
router.put("/updatepost/:postId/:userId", verifyToken, updatepost);
router.put("/bookmarkpost/:postId", verifyToken, bookmarkPost);
router.get("/mybookmarks/:userId", verifyToken, getMyBookmarks);

export default router;
