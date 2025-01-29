import { Router } from "express";
import userMiddleware from "../middleware/user.middleware";
import { resetPassword } from "../controllers/user.controller";

const router = Router();

router.post("/resetPassword",userMiddleware,resetPassword);

export default router;
