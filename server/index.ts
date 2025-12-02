import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Menu routes
import {
  getCategories,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createCategory,
} from "./routes/menu";

// Order routes
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderItemStatus,
  updatePaymentStatus,
} from "./routes/orders";

// Table routes
import {
  getTables,
  getTableById,
  createTable,
  updateTableStatus,
  updateTable,
  deleteTable,
} from "./routes/tables";

// Inventory routes
import {
  getInventory,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  updateInventoryQuantity,
  getInventoryTransactions,
  deleteInventoryItem,
} from "./routes/inventory";

// Customer routes
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "./routes/customers";

// Analytics routes
import { getAnalytics } from "./routes/analytics";

// Auth routes
import { login, getCurrentUser } from "./routes/auth";
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getProfitAnalysis,
} from "./routes/expenses";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/login", login);
  app.get("/api/auth/me", getCurrentUser);

  // Menu routes
  app.get("/api/menu/categories", getCategories);
  app.post("/api/menu/categories", createCategory);
  app.get("/api/menu/items", getMenuItems);
  app.get("/api/menu/items/:id", getMenuItemById);
  app.post("/api/menu/items", createMenuItem);
  app.put("/api/menu/items/:id", updateMenuItem);
  app.delete("/api/menu/items/:id", deleteMenuItem);

  // Order routes
  app.get("/api/orders", getOrders);
  app.get("/api/orders/:id", getOrderById);
  app.post("/api/orders", createOrder);
  app.put("/api/orders/:id/status", updateOrderStatus);
  app.put("/api/orders/:orderId/items/:itemId/status", updateOrderItemStatus);
  app.put("/api/orders/:id/payment", updatePaymentStatus);

  // Table routes
  app.get("/api/tables", getTables);
  app.get("/api/tables/:id", getTableById);
  app.post("/api/tables", createTable);
  app.put("/api/tables/:id", updateTable);
  app.put("/api/tables/:id/status", updateTableStatus);
  app.delete("/api/tables/:id", deleteTable);

  // Inventory routes
  app.get("/api/inventory", getInventory);
  app.get("/api/inventory/:id", getInventoryItemById);
  app.post("/api/inventory", createInventoryItem);
  app.put("/api/inventory/:id", updateInventoryItem);
  app.put("/api/inventory/:id/quantity", updateInventoryQuantity);
  app.get("/api/inventory/:id/transactions", getInventoryTransactions);
  app.delete("/api/inventory/:id", deleteInventoryItem);

  // Customer routes
  app.get("/api/customers", getCustomers);
  app.get("/api/customers/:id", getCustomerById);
  app.post("/api/customers", createCustomer);
  app.put("/api/customers/:id", updateCustomer);
  app.delete("/api/customers/:id", deleteCustomer);

  // Analytics routes
  app.get("/api/analytics", getAnalytics);

  // Expenses routes
  app.get("/api/expenses/profit", getProfitAnalysis);
  app.get("/api/expenses", getExpenses);
  app.get("/api/expenses/:id", getExpenseById);
  app.post("/api/expenses", createExpense);
  app.put("/api/expenses/:id", updateExpense);
  app.delete("/api/expenses/:id", deleteExpense);

  return app;
}
