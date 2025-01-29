import expenseRepository from "../repositories/expense.repository.js";
import whatsappService from "../services/whatsapp.service.js";

export const getExpenses = async (req, res) => {

try{
  let { startDate, endDate, offset, limit}= req.body
  const user = res.locals.userId;

  if(!startDate){
    startDate = "1970-01-01"
  }

  if(!endDate){
    endDate = new Date().toISOString().split("T")[0];
  }

  if(!offset){
    offset = 0;
  }

  if(!limit){
    limit = 10;
  }

  const result = await expenseRepository.getExpenses(user, startDate, endDate, offset, limit);

  console.log("Get expenses result", result);

  if(result.result === "failed"){
    return res.status(500).json({message: "Internal server error"});
  }
  if(result.payload.length === 0){
    return res.status(404).json({message: "No expenses found"});
  }
  if(result.result === "success"){
    return res.status(200).json({message: `${result.payload.length} Expenses found`, data: result.payload});
  }
}catch(error){
  console.log("Get expenses error", error);
  return res.status(500).json({message: "Internal server error"});
}

};

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
    console.log("Add Expense error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateExpense = async (req, res) => {};

export const deleteExpense = async (req, res) => {};
