import whatsappService from "../services/whatsapp.service.js";
import { extractPhoneNumber } from "../utils/strings.utils.js";
import userRepository from "../repositories/user.repository.js";
export const AddExpense = async (req, res) => {
  try {
    const { Body, From } = req.body;
    const senderContact = extractPhoneNumber(From);

    const user = await userRepository.getUserByNumber(senderContact);
    const userId =
      user.payload.userid == null ? senderContact : user.payload.userid;
    const result = await whatsappService.processIncomingMessage(Body, userId);

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
