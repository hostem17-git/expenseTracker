
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_LIFE } from "../config";

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

    const match = await bcrypt.compare(password.trim(), user.password);

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
  const { username, email, password, role } = req.body;
  let client = null;

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
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4);
    `,
      [username.trim(), email.trim(), encryptedPassword, role]
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

export const resetPassword = async (req, res) => {
  const { email, old_password, new_password } = req.body;
  let client = null;
  

  try {
     client = await pool.connect();

    const search = await client.query(
      `
        SELECT * 
        FROM users
        WHERE email = $1
        `,
      [email.trim()]
    );

    if (search.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = search.rows[0];

    const match = await bcrypt.compare(old_password.trim(), user.password);

    if (!match) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(new_password.trim(), salt);

    await client.query(
      `
        UPDATE users 
        SET password = $1 
        WHERE email = $2
        `,
      [encryptedPassword, email.trim()]
    );

    res.status(200).json({ message: `Password successfully set for ${email}` });
  } catch (error) {
    console.error("Error while resting user password", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client?.release();
  }
};
