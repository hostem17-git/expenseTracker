import { pool } from "../config/db.config.js";

class whatsappRepository {
  async saveMessage(data, user) {
    let client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const expense of Object.keys(data)) {
        const query = `
        INSERT INTO expenses (expense, amount, userid)
        VALUES ($1, $2, $3)
        RETURNING *;
        `;

        const values = [expense, data[expense], user];
        const result = await client.query(query, values);
        console.log('Inserted expense:', result.rows[0]);
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("Error writing data to db",error);
    } finally {
      client.release();
    }

  }
}

export default new whatsappRepository();
