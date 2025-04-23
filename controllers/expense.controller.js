import e from "express";
import expenseRepository from "../repositories/expense.repository.js";
import whatsappService from "../services/whatsapp.service.js";

/**
 * @notice Retrieves expenses for the signed-in user within a specified date range.
 * @param {object} req.startDate - (Optional) Start date for filtering expenses. Defaults to January 1, 1970.
 * @param {object} req.endDate - (Optional) End date for filtering expenses. Defaults to the current date.
 * @param {object} req.offset - (Optional) Number of records to skip. Defaults to 0.
 * @param {object} req.limit - (Optional) Maximum number of records to return. Defaults to 10.
 * @return {object} res.message - Status message indicating the outcome of the request.
 * @return {object} res.data - Object containing the retrieved expenses.
 */
export const getExpenseItems = async (req, res) => {
  try {
    let {
      startDate,
      endDate,
      offset,
      limit,
      primarycategory,
      secondarycategory,
    } = req.query;

    const user = res.locals.userId;

    if (!startDate) {
      startDate = "1970-01-01";
    }

    if (!endDate) {
      endDate = new Date().toISOString().split("T")[0];
    }

    if (!primarycategory) {
      primarycategory = null;
    }

    if (!secondarycategory) {
      secondarycategory = null;
    }

    if (!limit) {
      limit = 1000;
    }
    if (!offset) {
      offset = 0;
    }

    const result = await expenseRepository.getExpenseItems(
      user,
      startDate,
      endDate,
      primarycategory,
      secondarycategory,
      offset,
      limit
    );

    const rowCount = await expenseRepository.getExpenseCount(
      user,
      startDate,
      endDate,
      primarycategory,
      secondarycategory
    );

    if (result.result === "failed") {
      return res.status(500).json({ message: "Internal server error" });
    }
    if (result.payload.length === 0) {
      return res.status(404).json({ message: "No expenses found" });
    }
    if (result.result === "success") {
      return res.status(200).json({
        message: `${rowCount?.payload?.totalRows} Expenses found`,
        data: {
          rowCount: rowCount?.payload?.totalRows,
          payload: result.payload,
        },
      });
    }
  } catch (error) {
    console.log("Get expenses error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getExpenseSummaryPrimary = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    const user = res.locals.userId;

    if (!startDate) {
      startDate = "1970-01-01";
    }

    if (!endDate) {
      endDate = new Date().toISOString().split("T")[0];
    }

    const result = await expenseRepository.getExpenseSummaryPrimary(
      user,
      startDate,
      endDate
    );

    if (result.result === "failed") {
      return res.status(500).json({ message: "Internal server error" });
    }
    if (result.payload.length === 0) {
      return res.status(404).json({ message: "No expenses found" });
    }
    if (result.result === "success") {
      return res.status(200).json({
        message: `${result.payload.length} Expenses found`,
        data: result.payload,
      });
    }
  } catch (error) {
    console.log("Get expense summary error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getExpenseSummarySecondary = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    let { primaryCategory } = req.params;

    const user = res.locals.userId;

    if (!startDate) {
      startDate = "1970-01-01";
    }

    if (!endDate) {
      endDate = new Date().toISOString().split("T")[0];
    }

    if (!primaryCategory) {
      res.status(400).json({ message: "Primary category is required" });
    }

    const result = await expenseRepository.getExpenseSummarySecondary(
      user,
      primaryCategory,
      startDate,
      endDate
    );

    if (result.result === "failed") {
      return res.status(500).json({ message: "Internal server error" });
    }
    if (result.payload.length === 0) {
      return res.status(404).json({ message: "No expenses found" });
    }
    if (result.result === "success") {
      return res.status(200).json({
        message: `${result.payload.length} Expenses found`,
        data: result.payload,
      });
    }
  } catch (error) {
    console.log("Get expense summary error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @notice Adds single expenses for the signed-in user
 * @param {object} req.amount - Expense amount.
 * @param {object} req.expense - Expense remark
 * @param {object} req.Date - (Optional) Date of expense . Defaults to current date.
 * @param {object} req.category - (Optional)Expense category. Defaults to "Categorization pending".
 * @return {object} res.message - Status message indicating the outcome of the request.
 * @return {object} res.data - Object containing the retrieved expenses.
 */
export const addExpense = async (req, res) => {
  try {
    let { date, amount, expense, category } = req.body;
    
    if (!expense || !amount) {
      return res
        .status(400)
        .json({ message: "Expense and amount are required" });
    }

    if (!date) {
      date = new Date().toISOString().split("T")[0];
    }

    if (!category) {
      category = "Categorization pending";
    }

    const user = res.locals.userId;

    const result = await expenseRepository.AddExpense(
      user,
      expense,
      amount,
      category,
      date
    );

    if (result.result === "failed") {
      return res.status(500).json({ message: result.message });
    }

    if (result.result === "success") {
      return res
        .status(201)
        .json({ message: "Expense added successfully", data: result.payload });
    }
  } catch (error) {
    console.log("Add expense error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// TODO: implement check to ensure message format is correct.
export const bulkAddExpense = async (req, res) => {
  return res
    .status(500)
    .json({ message: "Bulk add expense implementation pending" });
  try {
    const { message } = req.body;
    const user = req.document.user;

    const result = await whatsappService.processIncomingMessage(message, user);

    res.status(201).json({
      success: true,
      message: "Expensed added successfully.",
      data: result,
    });
  } catch (error) {
    console.log("Add Expense error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @notice updates single expenses for the signed-in user
 * @param {object} req.amount - Expense amount.
 * @param {object} req.expense - Expense remark.
 * @param {object} req.Date - Date of expense.
 * @param {object} req.params - Expense ID.
 * @param {object} req.category - Expense category.
 *
 * @return {object} res.message - Status message indicating the outcome of the request.
 * @return {object} res.data - Object containing the retrieved expenses.
 */
export const updateExpense = async (req, res) => {
  try {
    let { created, amount, expense, primarycategory, secondarycategory } =
      req.body;
    const { id } = req.params;

    if (!expense || !amount) {
      return res
        .status(400)
        .json({ message: "Expense and amount are required" });
    }

    if (!created) {
      return res.status(400).json({ message: "date required" });
    }

    if (!primarycategory) {
      category = "Categorization pending";
    }

    if (!secondarycategory) {
      category = "Categorization pending";
    }

    const user = res.locals.userId;

    const result = await expenseRepository.updateExpense(
      id,
      expense,
      amount,
      primarycategory,
      secondarycategory,
      created,
      user
    );

    if (result.result === "failed") {
      return res.status(500).json({ message: result.message });
    }

    if (result.result === "success") {
      return res.status(200).json({
        message: "Expense updated successfully",
        data: result.payload,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @notice deletes single expenses for the signed-in user
 * @param {object} req.params - Expense ID.
 *
 * @return {object} res.message - Status message indicating the outcome of the request.
 * @return {object} res.data - Object containing the retrieved expenses.
 */
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const user = res.locals.userId;

    const result = await expenseRepository.deleteExpense(id, user);

    if (result.result === "failed") {
      return res.status(500).json({ message: result.message });
    }

    if (result.result === "success") {
      return res.status(200).json({
        message: "Expense deleted successfully",
        data: result.payload,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
