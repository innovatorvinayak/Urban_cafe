import { RequestHandler } from "express";
import { query } from "../db/connection";

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

// Get all orders (optimized - reduced queries)
export const getOrders: RequestHandler = async (req, res) => {
  try {
    const { status, table_id, date_from, date_to } = req.query;
    let sql = `
      SELECT 
        o.*,
        t.number as table_number,
        c.name as customer_name,
        u.name as user_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += " AND o.status = ?";
      params.push(status);
    }

    if (table_id) {
      sql += " AND o.table_id = ?";
      params.push(table_id);
    }

    if (date_from) {
      sql += " AND DATE(o.created_at) >= ?";
      params.push(date_from);
    }

    if (date_to) {
      sql += " AND DATE(o.created_at) <= ?";
      params.push(date_to);
    }

    sql += " ORDER BY o.created_at DESC LIMIT 100"; // Limit results

    const orders = await query(sql, params);
    
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.json([]);
    }

    const orderIds = (orders as any[]).map((o: any) => o.id);
    const placeholders = orderIds.map(() => '?').join(',');

    // Bulk fetch all order items (1 query instead of N)
    const allItems = await query(
      `SELECT 
        oi.*,
        mi.name as menu_item_name,
        mi.image as menu_item_image
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id IN (${placeholders})`,
      orderIds
    ) as any[];

    const itemIds = Array.isArray(allItems) ? allItems.map((i: any) => i.id) : [];
    
    // Bulk fetch variants and addons (2 queries instead of N*2)
    let allVariants: any[] = [];
    let allAddons: any[] = [];
    
    if (itemIds.length > 0) {
      const itemPlaceholders = itemIds.map(() => '?').join(',');
      allVariants = await query(
        `SELECT * FROM order_item_variants WHERE order_item_id IN (${itemPlaceholders})`,
        itemIds
      ) as any[];
      
      allAddons = await query(
        `SELECT * FROM order_item_addons WHERE order_item_id IN (${itemPlaceholders})`,
        itemIds
      ) as any[];
    }

    // Group items by order_id
    const itemsByOrderId = new Map();
    (Array.isArray(allItems) ? allItems : []).forEach((item: any) => {
      if (!itemsByOrderId.has(item.order_id)) {
        itemsByOrderId.set(item.order_id, []);
      }
      
      // Group variants and addons by item_id
      const itemVariants = (Array.isArray(allVariants) ? allVariants : [])
        .filter((v: any) => v.order_item_id === item.id);
      const itemAddons = (Array.isArray(allAddons) ? allAddons : [])
        .filter((a: any) => a.order_item_id === item.id);
      
      itemsByOrderId.get(item.order_id).push({
        ...item,
        unit_price: parseFloat(item.unit_price || 0),
        total_price: parseFloat(item.total_price || 0),
        variants: itemVariants,
        addons: itemAddons,
      });
    });

    // Combine results
    const ordersWithItems = (orders as any[]).map((order: any) => ({
      ...order,
      total: parseFloat(order.total || 0),
      subtotal: parseFloat(order.subtotal || 0),
      tax: parseFloat(order.tax || 0),
      discount: parseFloat(order.discount || 0),
      items: itemsByOrderId.get(order.id) || [],
    }));

    res.json(ordersWithItems);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
export const getOrderById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await query(
      `SELECT 
        o.*,
        t.number as table_number,
        c.name as customer_name,
        u.name as user_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?`,
      [id]
    );

    const ordersArray = Array.isArray(orders) ? orders : [];
    if (ordersArray.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = ordersArray[0];
    const items = await query(
      `SELECT 
        oi.*,
        mi.name as menu_item_name,
        mi.image as menu_item_image
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?`,
      [id]
    );

    const itemsWithExtras = await Promise.all(
      (Array.isArray(items) ? items : []).map(async (item: any) => {
        const variants = await query(
          "SELECT * FROM order_item_variants WHERE order_item_id = ?",
          [item.id]
        );
        const addons = await query(
          "SELECT * FROM order_item_addons WHERE order_item_id = ?",
          [item.id]
        );
        return {
          ...item,
          unit_price: parseFloat(item.unit_price || 0),
          total_price: parseFloat(item.total_price || 0),
          variants: Array.isArray(variants) ? variants : [],
          addons: Array.isArray(addons) ? addons : [],
        };
      })
    );

    res.json({
      ...order,
      total: parseFloat(order.total || 0),
      subtotal: parseFloat(order.subtotal || 0),
      tax: parseFloat(order.tax || 0),
      discount: parseFloat(order.discount || 0),
      items: itemsWithExtras,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create order
export const createOrder: RequestHandler = async (req, res) => {
  try {
    // Support both old format and new format from frontend
    const {
      table_id,
      customer_id,
      customerName, // Frontend sends this
      user_id,
      items,
      subtotal: providedSubtotal,
      tax: providedTax,
      total: providedTotal,
      tax_rate,
      discount,
      notes,
      paymentMethod, // Frontend sends this
      status: providedStatus, // Frontend sends this
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items are required" });
    }

    // Get user_id from header if not provided (from auth token)
    const userId = user_id || (req.headers["x-user-id"] as string) || null;

    // Handle customer - create if customerName is provided
    let finalCustomerId = customer_id || null;
    if (customerName && !customer_id) {
      // Create or find customer by name
      const existingCustomers = await query(
        "SELECT id FROM customers WHERE name = ? LIMIT 1",
        [customerName]
      );
      
      if (Array.isArray(existingCustomers) && existingCustomers.length > 0) {
        finalCustomerId = (existingCustomers as any[])[0].id;
      } else {
        // Create new customer
        const customerResult = await query(
          "INSERT INTO customers (name) VALUES (?)",
          [customerName]
        );
        finalCustomerId = (customerResult as any).insertId;
      }
    }

    // Use provided values or calculate
    let subtotal = providedSubtotal;
    let tax = providedTax;
    let total = providedTotal;

    // If not provided, calculate
    if (subtotal === undefined || tax === undefined || total === undefined) {
      subtotal = 0;
      for (const item of items) {
        // Support both menuItemId (frontend) and menu_item_id (backend)
        const menuItemId = item.menu_item_id || item.menuItemId;
        const menuItems = await query("SELECT price FROM menu_items WHERE id = ?", [
          menuItemId,
        ]);
        if (!Array.isArray(menuItems) || menuItems.length === 0) {
          return res.status(400).json({ error: `Menu item ${menuItemId} not found` });
        }
        const menuItem = (menuItems as any[])[0];
        let itemPrice = parseFloat(menuItem.price || 0);

        // Add variant price modifiers
        if (item.variants && Array.isArray(item.variants)) {
          for (const variant of item.variants) {
            const variants = await query(
              "SELECT price_modifier FROM menu_item_variants WHERE menu_item_id = ? AND name = ? AND value = ?",
              [menuItemId, variant.name, variant.value]
            );
            if (Array.isArray(variants) && variants.length > 0) {
              itemPrice += parseFloat((variants as any[])[0].price_modifier || 0);
            }
          }
        }

        // Add addon prices
        if (item.addons && Array.isArray(item.addons)) {
          for (const addon of item.addons) {
            const addons = await query(
              "SELECT price FROM menu_item_addons WHERE menu_item_id = ? AND name = ?",
              [menuItemId, addon.name]
            );
            if (Array.isArray(addons) && addons.length > 0) {
              itemPrice += parseFloat((addons as any[])[0].price || 0);
            }
          }
        }

        subtotal += itemPrice * item.quantity;
      }

      tax = subtotal * ((tax_rate || 10) / 100);
      total = subtotal + tax - (discount || 0);
    }

    const orderNumber = generateOrderNumber();
    const orderStatus = providedStatus || "confirmed";
    const paymentStatus = paymentMethod ? "paid" : "pending";
    
    // Map payment method values
    let finalPaymentMethod = paymentMethod;
    if (paymentMethod === "digital") {
      finalPaymentMethod = "upi"; // Map digital to upi
    } else if (paymentMethod && !["cash", "card", "upi", "other"].includes(paymentMethod)) {
      finalPaymentMethod = "other";
    }

    // Create order
    const result = await query(
      `INSERT INTO orders (order_number, table_id, customer_id, user_id, subtotal, tax, discount, total, status, payment_status, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        table_id || null,
        finalCustomerId,
        userId ? parseInt(userId) : null,
        subtotal,
        tax,
        discount || 0,
        total,
        orderStatus,
        paymentStatus,
        finalPaymentMethod || null,
        notes || null,
      ]
    );

    const orderId = (result as any).insertId;

    // Create order items
    for (const item of items) {
      // Support both menuItemId (frontend) and menu_item_id (backend)
      const menuItemId = item.menu_item_id || item.menuItemId;
      
      // Use provided price or fetch from database
      let unitPrice = item.price ? parseFloat(item.price) : 0;
      
      if (!item.price) {
        const menuItems = await query("SELECT price FROM menu_items WHERE id = ?", [
          menuItemId,
        ]);
        if (!Array.isArray(menuItems) || menuItems.length === 0) {
          console.error(`Menu item ${menuItemId} not found`);
          continue;
        }
        
        const menuItem = (menuItems as any[])[0];
        unitPrice = parseFloat(menuItem.price || 0);

        // Calculate unit price with variants and addons
        if (item.variants && Array.isArray(item.variants)) {
          for (const variant of item.variants) {
            const variants = await query(
              "SELECT price_modifier FROM menu_item_variants WHERE menu_item_id = ? AND name = ? AND value = ?",
              [menuItemId, variant.name, variant.value]
            );
            if (Array.isArray(variants) && variants.length > 0) {
              unitPrice += parseFloat((variants as any[])[0].price_modifier || 0);
            }
          }
        }

        if (item.addons && Array.isArray(item.addons)) {
          for (const addon of item.addons) {
            const addons = await query(
              "SELECT price FROM menu_item_addons WHERE menu_item_id = ? AND name = ?",
              [menuItemId, addon.name]
            );
            if (Array.isArray(addons) && addons.length > 0) {
              unitPrice += parseFloat((addons as any[])[0].price || 0);
            }
          }
        }
      }

      const totalPrice = unitPrice * item.quantity;

      const itemResult = await query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          menuItemId,
          item.quantity,
          unitPrice,
          totalPrice,
          item.notes || null,
          item.status || "pending",
        ]
      );

      const orderItemId = (itemResult as any).insertId;

      // Insert variants
      if (item.variants && Array.isArray(item.variants)) {
        for (const variant of item.variants) {
          await query(
            `INSERT INTO order_item_variants (order_item_id, variant_name, variant_value, price_modifier)
             VALUES (?, ?, ?, ?)`,
            [orderItemId, variant.name, variant.value, variant.price_modifier || 0]
          );
        }
      }

      // Insert addons
      if (item.addons && Array.isArray(item.addons)) {
        for (const addon of item.addons) {
          await query(
            `INSERT INTO order_item_addons (order_item_id, addon_name, addon_price)
             VALUES (?, ?, ?)`,
            [orderItemId, addon.name, addon.price]
          );
        }
      }
    }

    // Update table status if table_id is provided
    if (table_id) {
      await query("UPDATE tables SET status = 'running', current_order_id = ? WHERE id = ?", [
        orderId,
        table_id,
      ]);
    }

    const newOrderResult = await query(
      `SELECT 
        o.*,
        t.number as table_number,
        c.name as customer_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?`,
      [orderId]
    );

    const newOrder = Array.isArray(newOrderResult) && newOrderResult.length > 0
      ? (newOrderResult as any[])[0]
      : null;

    if (!newOrder) {
      return res.status(500).json({ error: "Failed to retrieve created order" });
    }

    res.status(201).json(newOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
export const updateOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    await query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);

    // If order is completed, free up the table
    if (status === "completed") {
      await query("UPDATE tables SET status = 'free', current_order_id = NULL WHERE current_order_id = ?", [
        id,
      ]);
    }

    const ordersResult = await query("SELECT * FROM orders WHERE id = ?", [id]);
    const updatedOrder = Array.isArray(ordersResult) && ordersResult.length > 0
      ? (ordersResult as any[])[0]
      : null;
    
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json({
      ...updatedOrder,
      total: parseFloat(updatedOrder.total || 0),
      subtotal: parseFloat(updatedOrder.subtotal || 0),
      tax: parseFloat(updatedOrder.tax || 0),
      discount: parseFloat(updatedOrder.discount || 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update order item status
export const updateOrderItemStatus: RequestHandler = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    await query("UPDATE order_items SET status = ? WHERE id = ? AND order_id = ?", [
      status,
      itemId,
      orderId,
    ]);

    const itemsResult = await query("SELECT * FROM order_items WHERE id = ?", [itemId]);
    const item = Array.isArray(itemsResult) && itemsResult.length > 0
      ? (itemsResult as any[])[0]
      : null;
    
    if (!item) {
      return res.status(404).json({ error: "Order item not found" });
    }
    
    res.json({
      ...item,
      unit_price: parseFloat(item.unit_price || 0),
      total_price: parseFloat(item.total_price || 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update payment status
export const updatePaymentStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_method } = req.body;

    if (!payment_status) {
      return res.status(400).json({ error: "Payment status is required" });
    }

    // Only update payment_method if provided
    if (payment_method !== null && payment_method !== undefined) {
      await query(
        "UPDATE orders SET payment_status = ?, payment_method = ? WHERE id = ?",
        [payment_status, payment_method, id]
      );
    } else {
      await query(
        "UPDATE orders SET payment_status = ? WHERE id = ?",
        [payment_status, id]
      );
    }

    const ordersResult = await query("SELECT * FROM orders WHERE id = ?", [id]);
    const updatedOrder = Array.isArray(ordersResult) && ordersResult.length > 0
      ? (ordersResult as any[])[0]
      : null;
    
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json({
      ...updatedOrder,
      total: parseFloat(updatedOrder.total || 0),
      subtotal: parseFloat(updatedOrder.subtotal || 0),
      tax: parseFloat(updatedOrder.tax || 0),
      discount: parseFloat(updatedOrder.discount || 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

