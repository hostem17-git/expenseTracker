import { Router } from "express";
import { addExpense, bulkAddExpense, deleteExpense, getExpenses, updateExpense } from "../controllers/expense.controller.js";

const router = Router();

router.get("/", getExpenses);

router.post("/bulk", bulkAddExpense);

router.post("/", addExpense);

router.put("/:id", updateExpense);

router.delete("/:id", deleteExpense);

export default router;
