
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_LIFE } from "../config/jwt.config.js";
import { pool } from "../config/db.config.js";

export const signin = async (req, res) => {
  const { email, password } = req.body;
  let client;
  try {
    client = await pool.connect();
    const search = await client.query(
      `
      SELECT *
      FROM users
      WHERE email = $1 ;
    `,
      [email.trim()]
    );

    if (search.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = search.rows[0];

    const match = await bcrypt.compare(password.trim(), user.encryptedpassword);

    if (!match) {
      return res
        .status(401)
        .json({ message: "Incorrect username or password" });
    }

    const token = jwt.sign(
      {
        email,
        role: user.role,
      },
      process.env.JWT_SECRET ,
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
  } finally {
    client?.release();
  }
};

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  let client = null;

  if(!username || !email || !password){
    return res.status(400).json({ message: "Please provide all the required fields" });
  }

  try {
    client = await pool.connect();

    const search = await client.query(
      `
      SELECT *
      FROM users
      WHERE username = $1 AND email = $2;
    `,
      [username.trim(), email.trim()]
    );

    if (search.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // password encryption
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password.trim(), salt);

    // Insert new user
    await client.query(
      `
      INSERT INTO users (username, email, encryptedpassword)
      VALUES ($1, $2, $3);
    `,
      [username.trim(), email.trim(), encryptedPassword]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error during user signup:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
client?.release();  }
};

export const signout = (req, res) => {
  try {
    res.cookie("token", {
      maxAge: 0,
      sameSite: "lax",
    });

    res.status(200).json({ message: "Signed out" });
  } catch (error) {
    console.log("Error during signout", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

