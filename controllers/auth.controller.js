import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_LIFE } from "../config/jwt.config.js";
import { pool } from "../config/db.config.js";

import userRepository from "../repositories/user.repository.js";

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await userRepository.getUserByEmailWithPassword(email);

    if (result.result ==="failed") {
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
        userId: user.id,
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
