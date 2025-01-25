import { Router } from "express";
import { addExpense, bulkAddExpense, deleteExpense, getExpenses, updateExpense } from "../controllers/expense.controller.js";

const router = Router();

router.get("/expenses", getExpenses);

router.post("/expense", addExpense);

router.post("/bulkexpense", bulkAddExpense);

router.put("/expenses/:id", updateExpense);

router.delete("/expenses/:id", deleteExpense);

export default router;
