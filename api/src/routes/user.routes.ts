import { Router } from "express";
import {
  updateUser,
  deleteAccount,
  signout,
  getUsers,
  deleteUser,
  getUser,
} from "../controllers/user.controller";
import verifyToken from "../utils/verifyUser";

const router: Router = Router();

router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteAccount);
router.post("/signout", signout);
router.get("/getusers", verifyToken, getUsers);
router.delete("/deleteuser/:userId", verifyToken, deleteUser);
router.get("/:userId", getUser);

export default router;
