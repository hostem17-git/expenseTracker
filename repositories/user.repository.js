import { pool } from "../config/db.config.js";

class userRepository {
  async addUser(username, email, encryptedPassword) {
    let client;

    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      client = await pool.connect();
      await client.query("BEGIN");

      const query = `
            INSERT INTO users (username, email, encryptedpassword)
            VALUES ($1, $2, $3)
            RETURNING username,email,contactnumber;
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
      if (client) {
        client.release();
      }
    }
    return response;
  }



  async addUserWithNumber(phoneNumber) {
    let client;

    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      client = await pool.connect();
      await client.query("BEGIN");

      const query = `
            INSERT INTO users (contactnumber)
            VALUES ($1)
            RETURNING userid,contactnumber;
      `;

      const values = [phoneNumber];
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
      if (client) {
        client.release();
      }
    }
    return response;
  }

  //   TODO:Test for non existing user.
  async getUserByEmailWithPassword(email) {
    let client;
    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      client = await pool.connect();
      const query = `
        SELECT * 
        FROM users
        Where email = $1;
      `;

      const values = [email];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        response.result = "failed";
        response.message = "No user found";
        return response;
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
      if (client) {
        client.release();
      }
    }
    return response;
  }

  async getUserByNumber(number) {
    let client;
    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      client = await pool.connect();
      const query = `
        SELECT username,email,contactnumber,userid
        FROM users
        Where contactnumber = $1;
      `;

      const values = [number];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        response.result = "failed";
        response.message = "No user found";
        return response;
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
      if (client) {
        client.release();
      }
    }
    return response;
  }


  async getUserList(offset, limit) {
    let client;
    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      client = await pool.connect();
      const query = `
        SELECT username,email,contactnumber
        FROM users
        ORDER BY userid ASC
        OFFSET $1
        LIMIT $2;
      `;

      const values = [offset, limit];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        response.result = "failed";
        response.message = "No users found";
      } else {
        response.result = "success";
        response.message = "User list retrieved successfully";
        response.payload = result.rows;
      }
    } catch (error) {
      console.log("Error getting user list", error);
      response.result = "failed";
      response.message = "Error fetching user list";
      response.payload = error;
    } finally {
      if (client) {
        client.release();
      }
    }
    return response;
  }

  async updateUserProfile(userId, username, email) {
    let client;
    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      client = await pool.connect();
      await client.query("BEGIN");
      const query = `
            UPDATE users 
            SET username = $1, email = $2
            WHERE userid = $3
            RETURNING username,email,contactnumber;
      `;

      const values = [username, email, userId];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        response.result = "failed";
        response.message = "No user found";
        return response;
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
      if (client) {
        client.release();
      }
    }
    return response;
  }

  
  async updateUserPassword(userId, encryptedPassword) {
    let client;
    let response = {
      result: "pending",
      message: "",
      payload: null,
    };
    try {
      client = await pool.connect();
      await client.query("BEGIN");
      const query = `
            UPDATE users 
            Set encryptedpassword = $1
            WHERE userid = $2
            RETURNING username,email,contactnumber;
      `;

      const values = [encryptedPassword, userId];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        response.result = "failed";
        response.message = "No user found";
        return response;
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
      if (client) {
        client.release();
      }
    }
    return response;
  }
}


export default new userRepository();
