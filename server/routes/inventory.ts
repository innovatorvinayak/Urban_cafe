import { RequestHandler } from "express";
import { query } from "../db/connection";

// Get all inventory items
export const getInventory: RequestHandler = async (req, res) => {
  try {
    const { category, low_stock, include_inactive } = req.query;
    let sql = "SELECT * FROM inventory_items WHERE 1=1";
    const params: any[] = [];

    // By default, only show active items
    if (include_inactive !== "true") {
      sql += " AND is_active = TRUE";
    }

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (low_stock === "true") {
      sql += " AND current_stock <= min_stock";
    }

    sql += " ORDER BY name ASC";

    const items = await query(sql, params);
    
    // Convert DECIMAL fields to numbers
    const itemsWithNumbers = (Array.isArray(items) ? items : []).map((item: any) => ({
      ...item,
      current_stock: parseFloat(item.current_stock || 0),
      min_stock: parseFloat(item.min_stock || 0),
      max_stock: item.max_stock ? parseFloat(item.max_stock) : null,
      unit_price: parseFloat(item.unit_price || 0),
    }));
    
    res.json(itemsWithNumbers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get inventory item by ID
export const getInventoryItemById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await query("SELECT * FROM inventory_items WHERE id = ?", [id]);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    const item = (items as any[])[0];
    res.json({
      ...item,
      current_stock: parseFloat(item.current_stock || 0),
      min_stock: parseFloat(item.min_stock || 0),
      max_stock: item.max_stock ? parseFloat(item.max_stock) : null,
      unit_price: parseFloat(item.unit_price || 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create inventory item
export const createInventoryItem: RequestHandler = async (req, res) => {
  try {
    const { name, category, unit, current_stock, min_stock, max_stock, unit_price, supplier } =
      req.body;

    if (!name || !unit) {
      return res.status(400).json({ error: "Name and unit are required" });
    }

    const result = await query(
      `INSERT INTO inventory_items (name, category, unit, current_stock, min_stock, max_stock, unit_price, supplier)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category || null,
        unit,
        current_stock || 0,
        min_stock || 0,
        max_stock || null,
        unit_price || 0,
        supplier || null,
      ]
    );

    const insertId = (result as any).insertId;
    const [items] = await query("SELECT * FROM inventory_items WHERE id = ?", [insertId]);

    res.status(201).json((items as any[])[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update inventory item
export const updateInventoryItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      unit,
      current_stock,
      min_stock,
      max_stock,
      unit_price,
      supplier,
    } = req.body;

    await query(
      `UPDATE inventory_items 
       SET name = COALESCE(?, name),
           category = COALESCE(?, category),
           unit = COALESCE(?, unit),
           current_stock = COALESCE(?, current_stock),
           min_stock = COALESCE(?, min_stock),
           max_stock = COALESCE(?, max_stock),
           unit_price = COALESCE(?, unit_price),
           supplier = COALESCE(?, supplier)
       WHERE id = ?`,
      [name, category, unit, current_stock, min_stock, max_stock, unit_price, supplier, id]
    );

    const [items] = await query("SELECT * FROM inventory_items WHERE id = ?", [id]);
    res.json((items as any[])[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update inventory quantity
export const updateInventoryQuantity: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type, reason, reference_id, reference_type, notes, created_by } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ error: "Quantity is required" });
    }

    // Get current stock
    const items = await query("SELECT current_stock FROM inventory_items WHERE id = ?", [id]);
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    const currentStock = parseFloat((items as any[])[0].current_stock);
    let newStock = currentStock;

    if (type === "in") {
      newStock = currentStock + parseFloat(quantity);
    } else if (type === "out") {
      newStock = currentStock - parseFloat(quantity);
    } else if (type === "adjustment") {
      newStock = parseFloat(quantity);
    } else if (type === "waste") {
      newStock = currentStock - parseFloat(quantity);
    } else {
      // Default: direct update
      newStock = parseFloat(quantity);
    }

    // Ensure stock doesn't go negative
    newStock = Math.max(0, newStock);

    // Update inventory item
    await query("UPDATE inventory_items SET current_stock = ?, last_restocked_at = NOW() WHERE id = ?", [newStock, id]);

    // Create transaction record
    if (type) {
      await query(
        `INSERT INTO inventory_transactions 
         (inventory_item_id, type, quantity, reason, reference_id, reference_type, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          type,
          Math.abs(parseFloat(quantity)),
          reason || null,
          reference_id || null,
          reference_type || null,
          notes || null,
          created_by || null,
        ]
      );
    }

    const updatedItemsResult = await query("SELECT * FROM inventory_items WHERE id = ?", [id]);
    const updatedItem = Array.isArray(updatedItemsResult) && updatedItemsResult.length > 0
      ? (updatedItemsResult as any[])[0]
      : null;
    
    if (!updatedItem) {
      return res.status(404).json({ error: "Failed to retrieve updated item" });
    }

    res.json({
      ...updatedItem,
      current_stock: parseFloat(updatedItem.current_stock || 0),
      min_stock: parseFloat(updatedItem.min_stock || 0),
      max_stock: updatedItem.max_stock ? parseFloat(updatedItem.max_stock) : null,
      unit_price: parseFloat(updatedItem.unit_price || 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get inventory transactions
export const getInventoryTransactions: RequestHandler = async (req, res) => {
  try {
    const { inventory_item_id, type, date_from, date_to } = req.query;
    let sql = `
      SELECT 
        it.*,
        ii.name as inventory_item_name,
        u.name as created_by_name
      FROM inventory_transactions it
      JOIN inventory_items ii ON it.inventory_item_id = ii.id
      LEFT JOIN users u ON it.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (inventory_item_id) {
      sql += " AND it.inventory_item_id = ?";
      params.push(inventory_item_id);
    }

    if (type) {
      sql += " AND it.type = ?";
      params.push(type);
    }

    if (date_from) {
      sql += " AND DATE(it.created_at) >= ?";
      params.push(date_from);
    }

    if (date_to) {
      sql += " AND DATE(it.created_at) <= ?";
      params.push(date_to);
    }

    sql += " ORDER BY it.created_at DESC";

    const transactions = await query(sql, params);
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete inventory item
export const deleteInventoryItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM inventory_items WHERE id = ?", [id]);
    res.json({ message: "Inventory item deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

