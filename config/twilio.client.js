import twilio from "twilio";
import { config } from 'dotenv';

config();

const twilioClient = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default twilioClient;
