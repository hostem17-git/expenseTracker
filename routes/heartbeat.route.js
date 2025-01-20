import { Router } from "express";
import { heartbeat } from "../controllers/heartbeat.controller.js";

const router = Router();

router.get("/",heartbeat);

export default router;
