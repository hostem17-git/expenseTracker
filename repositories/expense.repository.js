import { pool } from "../config/db.config.js";

//  {result: success, message:}
class expenseRepository {
  async saveMessage(data, user) {
    let client = await pool.connect();
    let response = {
      result: "pending",
      message: "",
      payload: null,
    };
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

        response.result = "success";
        response.message = "Expense added successy";
        response.payload =
          response.payload == null
            ? [result.rows[0]]
            : [...response.payload, result.rows[0]];

        console.log("Inserted expense:", result.rows[0]);
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("Error writing data to db", error);
      response.result = "failed";
      response.message = "failed to added expense";
      response.payload = error;
    } finally {
      client.release();
    }
    return response;
  }

  async getExpenseCount(user, startDate, endDate,primarycategory,secondarycategory) {
    let client = await pool.connect();

    let response = {
      result: "pending",
      message: "",
      payload: {
        totalRows: null,
        expenses: null,
      },
    };

    try {
      const query = `
        SELECT COUNT(*) 
        FROM expenses  
        WHERE userid = $1  
        AND created BETWEEN $2 AND $3  
        AND ($4::TEXT IS NULL OR primarycategory = $4::TEXT)  
        AND ($5::TEXT IS NULL OR secondarycategory = $5::TEXT)  
      `;

      const values = [
        user,
        startDate, 
        endDate, 
        primarycategory || null, 
        secondarycategory || null,
  ];
        
      const result = await client.query(query, values);
      response.result = "success";
      response.message = "Expense count retrieved successy";
      response.payload.totalRows = result.rows[0]?.count;
    } catch (error) {
      console.log("Error getting expenses", error);
      response.result = "failed";
      response.message = "Error fetching expenses";
      response.payload = error;
    } finally {
      client.release();
    }

    return response;
  }

  async getExpenseItems(user, startDate, endDate,primarycategory,secondarycategory, offset, limit) {
    let client = await pool.connect();

    let response = {
      result: "pending",
      message: "",
      payload: {
        totalRows: null,
        expenses: null,
      },
    };

    try {
      const query = `
        SELECT expense, amount, created, primarycategory, secondarycategory, id  
        FROM expenses  
        WHERE userid = $1  
        AND created BETWEEN $2 AND $3  
        AND ($4::TEXT IS NULL OR primarycategory = $4::TEXT)  
        AND ($5::TEXT IS NULL OR secondarycategory = $5::TEXT)  
        LIMIT $6 OFFSET $7;  
      `;

      const values = [
        user,
        startDate, 
        endDate, 
        primarycategory || null, 
        secondarycategory || null,
        limit,
        offset];

      const result = await client.query(query, values);
      response.result = "success";
      response.message = "Expenses retrieved successy";
      response.payload.totalRows = result.rowCount;
      response.payload.expenses = result.rows;
    } catch (error) {
      console.log("Error getting expenses", error);
      response.result = "failed";
      response.message = "Error fetching expenses";
      response.payload = error;
    } finally {
      client.release();
    }

    return response;
  }

  async getExpenseSummaryPrimary(user, startDate, endDate, offset, limit) {
    let client = await pool.connect();

    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      const query = `
        SELECT SUM(amount) as value,primarycategory as id
        FROM expenses
        WHERE userid = $1
        AND created BETWEEN $2 AND $3
        GROUP BY primarycategory
      `;

      const values = [user, startDate, endDate];
      const result = await client.query(query, values);

      response.result = "success";
      response.message = "Expenses retrieved successy";
      response.payload = result.rows;
    } catch (error) {
      console.log("Error getting expenses", error);
      response.result = "failed";
      response.message = "Error fetching expenses";
      response.payload = error;
    } finally {
      client.release();
    }

    return response;
  }

  async getExpenseSummarySecondary(user, primaryCategory, startDate, endDate) {
    let client = await pool.connect();

    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      const query = `
        SELECT SUM(amount) as value ,secondarycategory as id
        FROM expenses
        WHERE userid = $1 AND primarycategory = $2
        AND created BETWEEN $3 AND $4
        GROUP BY secondarycategory
      `;

      const values = [user, primaryCategory, startDate, endDate];
      const result = await client.query(query, values);

      response.result = "success";
      response.message = "Expenses retrieved successy";
      response.payload = result.rows;
    } catch (error) {
      console.log("Error getting expenses", error);
      response.result = "failed";
      response.message = "Error fetching expenses";
      response.payload = error;
    } finally {
      client.release();
    }

    return response;
  }

  async AddExpense(user, expense, amount, category, date) {
    let client = await pool.connect();

    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      await client.query("BEGIN");

      const query = `
        INSERT INTO expenses (userid, expense_name, amount, category, date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;

      const values = [user, expense, amount, category, date];
      const result = await client.query(query, values);

      console.log("Added expense:", result.rows[0]);
      await client.query("COMMIT");

      response.result = "success";
      response.message = "Expense added successy";
      response.payload = result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("Error adding expense", error);

      response.result = "failed";
      response.message = "Error adding expense";
      response.payload = error;
    } finally {
      client.release();
    }

    return response;
  }

  async updateExpense(expenseId, expense, amount, category, date, userId) {
    let client = await pool.connect();

    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      await client.query("BEGIN");

      const query = `
        UPDATE expenses
        SET  expense = $1, amount = $2, category = $3, created = $4
        WHERE id = $5 AND userid = $6
        returning *;
      `;
      const values = [expense, amount, category, date, expenseId, userId];

      const result = await client.query(query, values);

      if (result.rowCount === 0) {
        response.result = "failed";
        response.message = "Expense not found";
        return response;
      }

      console.log("Updated expense:", result.rows[0]);
      await client.query("COMMIT");

      response.result = "success";
      response.message = "Expense updated successfully";
      response.payload = result.rows[0];
    } catch (error) {
      console.log("Error updating expense", error);
      response.result = "failed";
      response.message = "Error updating expense";
      response.payload = error;
    } finally {
      client.release();
    }

    return response;
  }

  async deleteExpense(expenseId, user) {
    let client = await pool.connect();

    let response = {
      result: "pending",
      message: "",
      payload: null,
    };

    try {
      await client.query("BEGIN");

      const query = `
        DELETE FROM expenses
        WHERE id = $1 AND userid = $2
        RETURNING *;
      `;

      const values = [expenseId, user];
      const result = await client.query(query, values);

      if (result.rowCount === 0) {
        response.result = "failed";
        response.message = "Expense not found";
        return response;
      }

      console.log("Deleted expense:", result.rows[0]);
      await client.query("COMMIT");

      response.result = "success";
      response.message = "Expense deleted successfully";
      response.payload = result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("Error deleting expense", error);

      response.result = "failed";
      response.message = "Error deleting expense";
      response.payload = error;
    } finally {
      client.release();
    }

    return response;
  }
}
export default new expenseRepository();
