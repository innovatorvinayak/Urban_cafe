import { RequestHandler } from "express";
import { query } from "../db/connection";

// Get all categories
export const getCategories: RequestHandler = async (_req, res) => {
  try {
    const categories = await query(
      "SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC"
    );
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all menu items (optimized - single query)
export const getMenuItems: RequestHandler = async (req, res) => {
  try {
    const { category_id } = req.query;
    let sql = `
      SELECT 
        mi.*,
        c.name as category_name
      FROM menu_items mi
      JOIN categories c ON mi.category_id = c.id
      WHERE mi.is_available = TRUE
    `;
    const params: any[] = [];

    if (category_id) {
      sql += " AND mi.category_id = ?";
      params.push(category_id);
    }

    sql += " ORDER BY mi.display_order ASC, mi.name ASC";

    const items = await query(sql, params);

    // Optimized: Get all variants and addons in bulk (2 queries instead of N*2)
    const itemIds = (items as any[]).map((item: any) => item.id);
    
    let variants: any[] = [];
    let addons: any[] = [];
    
    if (itemIds.length > 0) {
      const placeholders = itemIds.map(() => '?').join(',');
      variants = await query(
        `SELECT * FROM menu_item_variants WHERE menu_item_id IN (${placeholders})`,
        itemIds
      ) as any[];
      
      addons = await query(
        `SELECT * FROM menu_item_addons WHERE menu_item_id IN (${placeholders}) AND is_available = TRUE`,
        itemIds
      ) as any[];
    }

    // Group variants and addons by menu_item_id
    const variantsMap = new Map();
    const addonsMap = new Map();
    
    (Array.isArray(variants) ? variants : []).forEach((v: any) => {
      if (!variantsMap.has(v.menu_item_id)) {
        variantsMap.set(v.menu_item_id, []);
      }
      variantsMap.get(v.menu_item_id).push(v);
    });
    
    (Array.isArray(addons) ? addons : []).forEach((a: any) => {
      if (!addonsMap.has(a.menu_item_id)) {
        addonsMap.set(a.menu_item_id, []);
      }
      addonsMap.get(a.menu_item_id).push(a);
    });

    // Combine results
    const itemsWithExtras = (items as any[]).map((item: any) => ({
      ...item,
      price: parseFloat(item.price) || 0,
      variants: variantsMap.get(item.id) || [],
      addons: addonsMap.get(item.id) || [],
    }));

    res.json(itemsWithExtras);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get menu item by ID
export const getMenuItemById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await query(
      `SELECT 
        mi.*,
        c.name as category_name
      FROM menu_items mi
      JOIN categories c ON mi.category_id = c.id
      WHERE mi.id = ?`,
      [id]
    );

    if (!(items as any[]).length) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    const item = (items as any[])[0];
    const [variants] = await query(
      "SELECT * FROM menu_item_variants WHERE menu_item_id = ?",
      [id]
    );
    const [addons] = await query(
      "SELECT * FROM menu_item_addons WHERE menu_item_id = ? AND is_available = TRUE",
      [id]
    );

    res.json({
      ...item,
      price: parseFloat(item.price) || 0, // Convert DECIMAL to number
      variants: variants || [],
      addons: addons || [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create menu item
export const createMenuItem: RequestHandler = async (req, res) => {
  try {
    const { name, category_id, description, price, image, is_available, display_order } = req.body;

    if (!name || !category_id || !price) {
      return res.status(400).json({ error: "Name, category_id, and price are required" });
    }

    const result = await query(
      `INSERT INTO menu_items (name, category_id, description, price, image, is_available, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, category_id, description || null, price, image || null, is_available !== false, display_order || 0]
    );

    const insertId = (result as any).insertId;
    const [items] = await query("SELECT * FROM menu_items WHERE id = ?", [insertId]);
    const newItem = (items as any[])[0];
    
    res.status(201).json({
      ...newItem,
      price: parseFloat(newItem.price) || 0, // Convert DECIMAL to number
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update menu item
export const updateMenuItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, description, price, image, is_available, display_order } = req.body;

    await query(
      `UPDATE menu_items 
       SET name = COALESCE(?, name),
           category_id = COALESCE(?, category_id),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           image = COALESCE(?, image),
           is_available = COALESCE(?, is_available),
           display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [name, category_id, description, price, image, is_available, display_order, id]
    );

    const [items] = await query("SELECT * FROM menu_items WHERE id = ?", [id]);
    const updatedItem = (items as any[])[0];
    res.json({
      ...updatedItem,
      price: parseFloat(updatedItem.price) || 0, // Convert DECIMAL to number
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete menu item
export const deleteMenuItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM menu_items WHERE id = ?", [id]);
    res.json({ message: "Menu item deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create category
export const createCategory: RequestHandler = async (req, res) => {
  try {
    const { name, description, display_order } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const result = await query(
      `INSERT INTO categories (name, description, display_order)
       VALUES (?, ?, ?)`,
      [name, description || null, display_order || 0]
    );

    const insertId = (result as any).insertId;
    const [categories] = await query("SELECT * FROM categories WHERE id = ?", [insertId]);

    res.status(201).json((categories as any[])[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

