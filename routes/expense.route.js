import { Router } from "express";
import {
  addExpense,
  bulkAddExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../controllers/expense.controller.js";
import userMiddleware from "../middleware/user.middleware.js";

const router = Router();

router.get("/", userMiddleware, getExpenses);

router.post("/bulk", userMiddleware, bulkAddExpense);

router.post("/", userMiddleware, addExpense);

router.put("/:id", userMiddleware, updateExpense);

router.delete("/:id", userMiddleware, deleteExpense);

export default router;
