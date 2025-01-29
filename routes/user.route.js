import { Router } from "express";
import userMiddleware from "../middleware/user.middleware.js";
import { resetPassword } from "../controllers/user.controller.js";

const router = Router();

router.post("/resetPassword",userMiddleware,resetPassword);

export default router;
