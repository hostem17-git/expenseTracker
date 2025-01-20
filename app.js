import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

import ExpenseRouter from "./routes/expense.route.js";
import WhatsappRouter from "./routes/whatsapp.route.js";
import UserRouter from "./routes/user.route.js";
import HeartbeatRouter from "./routes/heartbeat.route.js";

app.use(express.json());

const BASE_ROUTE = "/api/v1";
const PORT = process.env.PORT || 3002;

app.use(`${BASE_ROUTE}/expense`,ExpenseRouter);
app.use(`${BASE_ROUTE}/whatsapp`,WhatsappRouter);
app.use(`${BASE_ROUTE}/user`,UserRouter);
app.use(`${BASE_ROUTE}/heartbeat`,HeartbeatRouter);

// Invalid path hit
app.all("*",(req,res)=>{
    console.log("Invalid path hit");
    console.log(req.originalUrl);
    res.status(404).json({
        message:"Resource not found"
    });
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
