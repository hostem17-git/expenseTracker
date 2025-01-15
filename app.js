import express from "express";

const app = express();

import ExpenseRouter from "./routes/expense.route.js";
import WhatsappRouter from "./routes/whatsapp.route.js";


app.use(express.json());

const BASE_ROUTE = "/api/v1";
const PORT = process.env.PORT || 3000;


app.use(`${BASE_ROUTE}/expense`,ExpenseRouter)
app.use(`${BASE_ROUTE}/whatsapp`,WhatsappRouter)

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
