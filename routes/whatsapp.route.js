import { Router } from "express";
import { whatsAppMiddleWare } from "../middleware/whatsapp.middleware.js";
import { AddExpense } from "../controllers/whatsapp.controller.js";
import twilio from "twilio";


const router = Router();

router.post("/",twilio.webhook(),whatsAppMiddleWare,AddExpense);

export default router;
