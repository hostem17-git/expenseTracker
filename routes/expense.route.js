import { Router } from "express";
import { AddExpense, deleteExpense, getExpenses, updateExpense } from "../controllers/expense.controller";

const router = Router();

router.get("/expenses", getExpenses);

router.post("/expenses", AddExpense);

router.put("/expenses/:id", updateExpense);

router.delete("/expenses/:id", deleteExpense);

export default router;
