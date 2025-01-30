import { Router } from "express";
import { whatsAppMiddleWare } from "../middleware/whatsapp.middleware.js";
import { AddExpense } from "../controllers/whatsapp.controller.js";
import twilio from "twilio";

// const temp = (req,res,next)=>{

//     const temp = ;
//     temp(req,res,next);
//     next();
// }

const router = Router();

router.post("/",whatsAppMiddleWare,twilio.webhook(),AddExpense);

export default router;
