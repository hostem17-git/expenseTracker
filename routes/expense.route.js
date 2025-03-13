import { Router } from "express";
import {
  addExpense,
  bulkAddExpense,
  deleteExpense,
  getExpenseItems,
  getExpenseSummaryPrimary,
  getExpenseSummarySecondary,
  updateExpense,
} from "../controllers/expense.controller.js";
import userMiddleware from "../middleware/user.middleware.js";

const router = Router();

router.get("/", userMiddleware, getExpenseItems);

router.get("/summary", userMiddleware, getExpenseSummaryPrimary);

router.get("/summary/:primaryCategory", userMiddleware, getExpenseSummarySecondary);

router.post("/bulk", userMiddleware, bulkAddExpense);

router.post("/", userMiddleware, addExpense);

router.put("/:id", userMiddleware, updateExpense);

router.delete("/:id", userMiddleware, deleteExpense);

export default router;
