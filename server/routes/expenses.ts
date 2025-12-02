import { RequestHandler } from "express";
import { query } from "../db/connection";

// Get all expenses
export const getExpenses: RequestHandler = async (req, res) => {
  try {
    const { date_from, date_to, category } = req.query;
    let sql = `
      SELECT 
        e.*,
        u.name as created_by_name
      FROM expenses e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (date_from) {
      sql += " AND e.date >= ?";
      params.push(date_from);
    }

    if (date_to) {
      sql += " AND e.date <= ?";
      params.push(date_to);
    }

    if (category) {
      sql += " AND e.category = ?";
      params.push(category);
    }

    sql += " ORDER BY e.date DESC, e.created_at DESC";

    const expenses = await query(sql, params);
    
    const expensesWithNumbers = (Array.isArray(expenses) ? expenses : []).map((exp: any) => ({
      ...exp,
      amount: parseFloat(exp.amount || 0),
    }));
    
    res.json(expensesWithNumbers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get expense by ID
export const getExpenseById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const expenses = await query("SELECT * FROM expenses WHERE id = ?", [id]);

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const expense = (expenses as any[])[0];
    res.json({
      ...expense,
      amount: parseFloat(expense.amount || 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create expense
export const createExpense: RequestHandler = async (req, res) => {
  try {
    const { date, category, description, amount, payment_method, notes, created_by } = req.body;

    if (!date || !category || !description || !amount) {
      return res.status(400).json({ error: "Date, category, description, and amount are required" });
    }

    const userId = created_by || (req.headers["x-user-id"] as string) || null;

    const result = await query(
      `INSERT INTO expenses (date, category, description, amount, payment_method, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, category, description, amount, payment_method || null, notes || null, userId]
    );

    const insertId = (result as any).insertId;
    const newExpenses = await query("SELECT * FROM expenses WHERE id = ?", [insertId]);
    
    const newExpense = Array.isArray(newExpenses) && newExpenses.length > 0
      ? (newExpenses as any[])[0]
      : null;

    res.status(201).json({
      ...newExpense,
      amount: parseFloat(newExpense?.amount || 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update expense
export const updateExpense: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, category, description, amount, payment_method, notes } = req.body;

    await query(
      `UPDATE expenses 
       SET date = COALESCE(?, date),
           category = COALESCE(?, category),
           description = COALESCE(?, description),
           amount = COALESCE(?, amount),
           payment_method = COALESCE(?, payment_method),
           notes = COALESCE(?, notes)
       WHERE id = ?`,
      [date, category, description, amount, payment_method, notes, id]
    );

    const updatedExpenses = await query("SELECT * FROM expenses WHERE id = ?", [id]);
    const expense = Array.isArray(updatedExpenses) && updatedExpenses.length > 0
      ? (updatedExpenses as any[])[0]
      : null;

    res.json({
      ...expense,
      amount: parseFloat(expense?.amount || 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete expense (mark as inactive instead of actual delete due to permission constraints)
export const deleteExpense: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to delete, if permission denied, mark as deleted via notes
    try {
      await query("DELETE FROM expenses WHERE id = ?", [id]);
      res.json({ message: "Expense deleted successfully" });
    } catch (deleteError: any) {
      if (deleteError.code === 'ER_TABLEACCESS_DENIED_ERROR') {
        // If DELETE permission denied, update the expense to mark it as deleted
        await query(
          "UPDATE expenses SET notes = CONCAT(COALESCE(notes, ''), ' [DELETED]'), amount = 0 WHERE id = ?",
          [id]
        );
        res.json({ message: "Expense marked as deleted" });
      } else {
        throw deleteError;
      }
    }
  } catch (error: any) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get profit analysis
export const getProfitAnalysis: RequestHandler = async (req, res) => {
  try {
    const { period = 'week', date_from, date_to } = req.query;
    
    let dateFrom: string;
    let dateTo: string = new Date().toISOString().split('T')[0];

    // Calculate date ranges based on period
    const now = new Date();
    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFrom = weekAgo.toISOString().split('T')[0];
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFrom = monthAgo.toISOString().split('T')[0];
    } else if (period === 'quarter') {
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      dateFrom = quarterAgo.toISOString().split('T')[0];
    } else if (period === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFrom = yearAgo.toISOString().split('T')[0];
    } else {
      dateFrom = (date_from as string) || dateTo;
    }

    if (date_to) {
      dateTo = date_to as string;
    }

    // Get total revenue
    const revenueResult = await query(
      `SELECT COALESCE(SUM(total), 0) as total_revenue
       FROM orders
       WHERE status NOT IN ('cancelled', 'draft')
         AND DATE(created_at) >= ?
         AND DATE(created_at) <= ?`,
      [dateFrom, dateTo]
    );
    const totalRevenue = parseFloat((Array.isArray(revenueResult) && revenueResult[0] 
      ? (revenueResult as any[])[0].total_revenue 
      : 0));

    // Get total expenses
    const expensesResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total_expenses
       FROM expenses
       WHERE date >= ?
         AND date <= ?`,
      [dateFrom, dateTo]
    );
    const totalExpenses = parseFloat((Array.isArray(expensesResult) && expensesResult[0]
      ? (expensesResult as any[])[0].total_expenses
      : 0));

    // Get expenses by category
    const expensesByCategory = await query(
      `SELECT 
        category,
        SUM(amount) as total
       FROM expenses
       WHERE date >= ? AND date <= ?
       GROUP BY category
       ORDER BY total DESC`,
      [dateFrom, dateTo]
    );

    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    res.json({
      period,
      dateFrom,
      dateTo,
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin,
      expensesByCategory: (Array.isArray(expensesByCategory) ? expensesByCategory : []).map((cat: any) => ({
        ...cat,
        total: parseFloat(cat.total || 0),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

