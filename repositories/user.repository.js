import { pool } from "../config/db.config.js";
  
class userRepository {
  // TODO:Test for already existing user.
  async addUser(username, email, encryptedPassword) {
    let client = await pool.connect();

    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

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

      response.result = "success";
      response.message = "User added successfully";
      response.payload = result.rows[0];

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("Error writing user to db", error);
      response.result = "failed";
      response.message = "Error adding user";
      response.payload = error;
    } finally {
      client.release();
    }
    return response;
  }

  //   TODO:Test for non existing user.
  async getUser(email) {
    let client = await pool.connect();
    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      const query = `
        SELECT Username,Email,ContactNumber
        FROM Users
        Where email = $1;
      `;

      const values = [email];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        response.result = "failed";
        response.message = "No user found";
      }

      response.result = "success";
      response.message = "User found";
      response.payload = result.rows[0];
    } catch (error) {
      console.log("Error getting user", error);
      response.result = "failed";
      response.message = "Error fetching user";
      response.payload = error;
    } finally {
      client.release();
    }
    return response;
  }

  async getUserByNumber(number) {
    let client = await pool.connect();
    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      const query = `
        SELECT username,email,contactnumber,userid
        FROM Users
        Where contactnumber = $1;
      `;

      const values = [number];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        response.result = "failed";
        response.message = "No user found";
      }

      response.result = "success";
      response.message = "User found";
      response.payload = result.rows[0];
    } catch (error) {
      console.log("Error getting user", error);
      response.result = "failed";
      response.message = "Error fetching user";
      response.payload = error;
    } finally {
      client.release();
    }
    return response;
  }

  async getUserList(offset, limit) {
    let client = await pool.connect();
    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      const query = `
        SELECT Username,Email,ContactNumber
        FROM Users
        OFFSET $1
        LIMIT $2;
      `;

      const values = [offset, limit];
      const result = await client.query(query, values);

      response.result = "success";
      response.message = "User list retrieved successfully";
      response.payload = result.rows;
    } catch (error) {
      console.log("Error getting user list", error);
      response.result = "failed";
      response.message = "Error fetching user list";
      response.payload = error;
    } finally {
      client.release();
    }
    return response;

  }

  async updateUserProfile(userId, username, email) {
    let client = await pool.connect();
    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

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

      if (result.rows.length === 0) {
        response.result = "failed";
        response.message = "No user found";
      }

      console.log("Updated user:", result.rows[0]);
      await client.query("COMMIT");

      response.result = "success";
      response.message = "User profile updated successfully";
      response.payload = result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("Error updating user profile", error);
      response.result = "failed";
      response.message = "Error updating user profile";
      response.payload = error;
    } finally {
      client.release();
    }
    return response;
  }

  async updateUserPassword(userId, encryptedPassword) {
    let client = await pool.connect();
    let response = {
      result: "pending",
      message: "",
      payload: null,
    };
    try {
      await client.query("BEGIN");
      const query = `
            UPDATE Users 
            Set EncryptedPassword = $1
            WHERE id = $2
            RETURNING Username,Email,ContactNumber;
      `;

      const values = [encryptedPassword, userId];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        response.result = "failed";
        response.message = "No user found";
      }
      await client.query("COMMIT");

      console.log("Updated user password:", result.rows[0]);

      response.result = "success";
      response.message = "User password updated successfully";
      response.payload = result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("Error updating user password", error);
      response.result = "failed";
      response.message = "Error updating user profile";
      response.payload = error;
    } finally {
      client.release();
    }
    return response;

  }
}
export default new userRepository();
