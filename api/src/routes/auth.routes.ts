import { signup, signin, google } from "../controllers/auth.controller";
import { Router } from "express";

const router: Router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);

export default router;
