import express from "express";
import { Router } from "express";
import { whatsAppMiddleWare } from "../middleware/whatsapp.middleware.js";
import { AddExpense } from "../controllers/whatsapp.controller.js";

const router = Router();

router.post("/",express.urlencoded({ extended: false }),whatsAppMiddleWare,AddExpense);

export default router;
