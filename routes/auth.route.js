import { Router } from "express";
import {
  sendOTP,
  signin,
  signout,
  signup,
  verifyOTP,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.post("/signout", signout);

router.post("/sendOTP", sendOTP);

router.post("/verifyOTP", verifyOTP);

export default router;
