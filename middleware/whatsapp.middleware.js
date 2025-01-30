import twilio from "twilio";

export const whatsAppMiddleWare = async (req, res, next) => {
  try {
    const twilioSignature = req.headers["x-twilio-signature"];
    const webhookUrl = process.env.TWILIO_WEBHOOK_URL;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const isValid = twilio.validateRequest(
      TWILIO_AUTH_TOKEN,
      twilioSignature,
      webhookUrl,
      req.body
    );

    if (!isValid) {
        console.log("Invalid Request received",req);

      return res.status(403).send("Invalid Request");
    }

    next();
  } catch (error) {
    console.log("Error in whatsAppMiddleWare", error);
  }
};

