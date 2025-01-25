import { pool } from "../config/db.config.js";

class userRepository {
  // TODO:Test for already existing user.
  async addUser(username, email, encryptedPassword) {
    let client = await pool.connect();

    try {
      await client.query("BEGIN");

      const query = `
            INSERT INTO Users (Username, Email, EncryptedPassword)
            VALUES ($1, $2, $3)
            RETURNING Username,Email,ContactNumber;
      `;

      const values = [username, email, encryptedPassword];
      const result = await client.query(query, values);
      console.log("Added user:", result.rows[0]);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("Error writing user to db", error);
    } finally {
      client.release();
    }
  }

//   TODO:Test for non existing user.
  async getUser(email) {
    let client = await pool.connect();
    let result = null;

    try {
      const query = `
        SELECT Username,Email,ContactNumber
        FROM Users
        Where email = $1;
      `;

      const values = [email];
      result = await client.query(query, values);
      return  result.rows[0];
    } catch (error) {
      console.log("Error getting user", error);
    }finally {
      client.release();
    };
  }

  async getUserList(offset,limit){
    let client = await pool.connect();
    let result = null;

    try {
      const query = `
        SELECT Username,Email,ContactNumber
        FROM Users
        OFFSET $1
        LIMIT $2;
      `;

      const values = [offset,limit];
      result = await client.query(query, values);
      return  result.rows;
    } catch (error) {
      console.log("Error getting user list", error);
    }finally {
      client.release();
    };
  }

  async updateUserProfile(userId,username,email) {
    let client = await pool.connect();

    try {
      await client.query("BEGIN");
      const query = `
            UPDATE Users 
            SET Username = $1, Email = $2
            WHERE id = $3
            RETURNING Username,Email,ContactNumber;
      `;

      const values = [username, email, userId];
      const result = await client.query(query, values);
      console.log("Updated user:", result.rows[0]);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("Error updating user profile", error);
    } finally {
      client.release();
    }

  }

  async updateUserPassword(userId,encryptedPassword) {

    let client = await pool.connect();

    try {
      await client.query("BEGIN");
      const query = `
            UPDATE Users 
            Set EncryptedPassword = $1
            WHERE id = $2
            RETURNING Username,Email,ContactNumber;
      `;

      const values = [encryptedPassword , userId];
      const result = await client.query(query, values);
      console.log("Updated user:", result.rows[0]);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("Error updating user password", error);
    } finally {
      client.release();
    }


  }

}
export default new userRepository();
