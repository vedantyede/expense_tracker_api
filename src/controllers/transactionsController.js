import { sql } from "../config/db.js";

export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;

    const transactions = await sql`
      SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
      `

    res.status(200).json(transactions)
  } catch (error) {
    console.log("Eror getting the transaction ", error)
    res.status(500).json({ mesage: "Internal server error" })
  }
}

export async function createTransaction(req, res) {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || amount === undefined || !category || !user_id) {
      return res.status(400).json({ message: "All fileds are required" })
    }

    const transaction = await sql`
      INSERT INTO transactions(user_id,title,amount,category)
      VALUES (${user_id},${title},${amount},${category})
      RETURNING *  
      `
    // status code 200: somethings is created
    // console.log(transaction)
    // above console.log give give below response 
    //[{
    // id: 1,
    // user_id: '123',
    // title: 'salary',
    // amount: '2000.00',
    // category: 'income',
    // created_at: 2025-06-06T18:30:00.000Z
    //}]
    res.status(201).json(transaction[0])

  } catch (error) {
    console.log("Eror creating the transaction ", error)
    res.status(500).json({ mesage: "Internal server error" })
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid transaction ID" })
    }
    const result = await sql`
      DELETE FROM transactions WHERE id = ${id} RETURNING *
      `

    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    res.status(200).json({ message: "Transaction deleted successfully" })
  } catch (error) {
    console.log("Error deleting the transaction ", error)
    res.status(500).json({ mesage: "Internal server error" })
  }

}

export async function getTransactionsSummaryByUserId(req, res) {
  try {
    const { userId } = req.params;

    const balanceResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId}
    `;

    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as income FROM transactions WHERE user_id = ${userId} AND amount > 0
    `;

    const expenseResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as expense FROM transactions WHERE user_id = ${userId} AND amount < 0
    `;

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expenseResult[0].expense
    })

  } catch (error) {
    console.log("Error getting the summary ", error)
    res.status(500).json({ mesage: "Internal server error" })
  }
}