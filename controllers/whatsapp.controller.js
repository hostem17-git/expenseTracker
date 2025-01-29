import whatsappService from "../services/whatsapp.service.js";

export const AddExpense = async (req, res) => {
  try {
    const { Body, From } = req.body;
    const result = await whatsappService.processIncomingMessage(Body, From);

    res.status(201).json({
      success: true,
      message: "Message processed successfully.",
      data: result,
    });
  } catch (error) {
    console.log("Add Expense error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
