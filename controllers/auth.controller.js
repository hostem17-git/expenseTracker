import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_LIFE } from "../config/jwt.config.js";
import { pool } from "../config/db.config.js";

import userRepository from "../repositories/user.repository.js";
import twilioClient from "../config/twilio.client.js";

const otpStore = new Map();

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await userRepository.getUserByEmailWithPassword(email);

    if (result.result === "failed") {
      if (result.message == "No user found") {
        return res.status(404).json({ message: "User not found" });
      } else {
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    const user = result.payload;

    const match = await bcrypt.compare(password.trim(), user.encryptedpassword);

    if (!match) {
      return res
        .status(401)
        .json({ message: "Incorrect username or password" });
    }

    const token = jwt.sign(
      {
        email,
        userId: user.userid,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: JWT_LIFE,
      }
    );

    res.cookie("token", token, {
      maxAge: JWT_LIFE * 1000,
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Signed in successfully",
      payload: {
        email,
        role: user.role,
        username: user.username,
        life: JWT_LIFE,
      },
    });
  } catch (error) {
    console.log("Error during signin", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all the required fields" });
  }

  try {
    const search = await userRepository.getUserByEmailWithPassword(email);

    if (search.result == "success") {
      return res.status(400).json({ message: "Email already exists" });
    }

    // password encryption
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password.trim(), salt);

    const addToDB = await userRepository.addUser(
      username.trim(),
      email.trim(),
      encryptedPassword
    );
    console.log("add to db", addToDB);
    if (!(addToDB.result === "success")) {
      if (addToDB.payload.code === "23505") {
        return res.status(409).json({ message: "User already exists" });
      } else return res.status(404).json({ message: "Internal server error" });
    }

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error during user signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signout = (req, res) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
      sameSite: "lax",
    });

    res.status(200).json({ message: "Signed out" });
  } catch (error) {
    console.log("Error during signout", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

  // Store in memory
  otpStore.set(phoneNumber, { otp, expiresAt });

  try {
    await twilioClient.messages.create({
      to: `whatsapp:${phoneNumber}`,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    console.log(`OTP ${otp} sent to ${phoneNumber}`);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res
      .status(400)
      .json({ message: "Phone number and OTP are required" });
  }

  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      message: "OTP must be 6 digits",
    });
  }

  const record = otpStore.get(phoneNumber);

  if (!record) {
    return res.status(400).json({ message: "No OTP found for this number" });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phoneNumber);
    return res
      .status(400)
      .json({ message: "OTP expired. Please request a new one." });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  otpStore.delete(phoneNumber); // Clean up on success

  let result = await userRepository.getUserByNumber(phoneNumber);

  if (result.result === "failed") {
    if (result.message == "No user found") {
      const addToDB = await userRepository.addUserWithNumber(phoneNumber);

      if (addToDB.result === "success") {
        result = addToDB.payload;
      } else {
        return res.status(500).json({ message: "Unable to add user" });
      }
      // TODO: Create user if not found.
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  const user = result.payload;

  const token = jwt.sign(
    {
      userId: user.userid,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_LIFE,
    }
  );

  res.cookie("token", token, {
    maxAge: JWT_LIFE * 1000,
    sameSite: "lax",
  });

  res.status(200).json({
    message: "Signed in successfully",
    payload: {
      role: user.role,
      username: user?.username || "User",
      life: JWT_LIFE,
      access_token: token,
    },
  });
};
