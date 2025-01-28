import { pool } from "../config/db.config";


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
  