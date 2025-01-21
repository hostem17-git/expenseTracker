import expenseRepository from "../repositories/expense.repository.js";
import { extractAmount, normalizeName } from "../utils/strings.utils.js";

class WhatsappService {
  async processIncomingMessage(message, sender) {
    try {
      const inputLines = message.trim().split("\n");
      const data = {};

      inputLines.forEach((line) => {
        const parts = line.trim().split(" ");
        const amountStr = parts.pop();
        const amount = extractAmount(amountStr);
        const expense = normalizeName(parts.join(" "));

        if (data[expense]) {
          data[expense] += amount;
        } else {
          data[expense] = amount;
        }
      });

      await expenseRepository.saveMessage(data, sender);
    } catch (error) {
      console.log("Error processing message", error);
    }

    // TODO fix response
    return { success: true, message: "Data processed and saved successfully." };
  }
}

export default new WhatsappService();
