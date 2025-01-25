import whatsappService from "../services/whatsapp.service.js";

export const getExpenses = async (req, res) => {};

// TODO: Validate payload contains multiple expenses only.
export const addExpense = async (req, res) => {
  return res.status(200).json({message: "Add single expense"});

};

export const bulkAddExpense = async (req, res) => {
  return res.status(200).json({message: "Bulk add expense"});
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
    return res.status(501).json({ message: "Internal server error" });
    console.log("Add Expense error", error);
  }
};

export const updateExpense = async (req, res) => {};

export const deleteExpense = async (req, res) => {};
