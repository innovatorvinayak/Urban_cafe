import { RequestHandler } from "express";
import { query } from "../db/connection";

// Get all customers
export const getCustomers: RequestHandler = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = "SELECT * FROM customers WHERE 1=1";
    const params: any[] = [];

    if (search) {
      sql += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += " ORDER BY created_at DESC";

    const customers = await query(sql, params);
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get customer by ID
export const getCustomerById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [customers] = await query("SELECT * FROM customers WHERE id = ?", [id]);

    if (!(customers as any[]).length) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json((customers as any[])[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create customer
export const createCustomer: RequestHandler = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const result = await query(
      `INSERT INTO customers (name, email, phone, address)
       VALUES (?, ?, ?, ?)`,
      [name, email || null, phone || null, address || null]
    );

    const insertId = (result as any).insertId;
    const [customers] = await query("SELECT * FROM customers WHERE id = ?", [insertId]);

    res.status(201).json((customers as any[])[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update customer
export const updateCustomer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    await query(
      `UPDATE customers 
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address)
       WHERE id = ?`,
      [name, email, phone, address, id]
    );

    const [customers] = await query("SELECT * FROM customers WHERE id = ?", [id]);
    res.json((customers as any[])[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete customer
export const deleteCustomer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM customers WHERE id = ?", [id]);
    res.json({ message: "Customer deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

