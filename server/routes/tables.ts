import { RequestHandler } from "express";
import { query } from "../db/connection";

// Get all tables
export const getTables: RequestHandler = async (_req, res) => {
  try {
    const tables = await query(
      `SELECT 
        t.*,
        o.order_number as current_order_number,
        o.status as current_order_status
      FROM tables t
      LEFT JOIN orders o ON t.current_order_id = o.id
      ORDER BY t.number ASC`
    );
    res.json(tables);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get table by ID
export const getTableById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [tables] = await query(
      `SELECT 
        t.*,
        o.order_number as current_order_number,
        o.status as current_order_status
      FROM tables t
      LEFT JOIN orders o ON t.current_order_id = o.id
      WHERE t.id = ?`,
      [id]
    );

    if (!(tables as any[]).length) {
      return res.status(404).json({ error: "Table not found" });
    }

    res.json((tables as any[])[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create table
export const createTable: RequestHandler = async (req, res) => {
  try {
    const { number, capacity } = req.body;

    if (!number) {
      return res.status(400).json({ error: "Table number is required" });
    }

    const result = await query(
      "INSERT INTO tables (number, capacity) VALUES (?, ?)",
      [number, capacity || 4]
    );

    const insertId = (result as any).insertId;
    const [tables] = await query("SELECT * FROM tables WHERE id = ?", [insertId]);

    res.status(201).json((tables as any[])[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update table status
export const updateTableStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    await query("UPDATE tables SET status = ? WHERE id = ?", [status, id]);

    const [tables] = await query("SELECT * FROM tables WHERE id = ?", [id]);
    res.json((tables as any[])[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update table
export const updateTable: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { number, capacity, status } = req.body;

    await query(
      `UPDATE tables 
       SET number = COALESCE(?, number),
           capacity = COALESCE(?, capacity),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [number, capacity, status, id]
    );

    const [tables] = await query("SELECT * FROM tables WHERE id = ?", [id]);
    res.json((tables as any[])[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete table
export const deleteTable: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM tables WHERE id = ?", [id]);
    res.json({ message: "Table deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

