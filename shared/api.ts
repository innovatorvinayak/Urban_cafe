/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// User types
export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "manager" | "cashier" | "kitchen";
  is_active?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Menu item types
export interface MenuItemVariant {
  id: number;
  menu_item_id: number;
  name: string;
  value: string;
  price_modifier: number;
}

export interface MenuItemAddon {
  id: number;
  menu_item_id: number;
  name: string;
  price: number;
  is_available: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  category_id: number;
  category_name?: string;
  description?: string;
  price: number;
  image?: string;
  is_available: boolean;
  display_order: number;
  variants?: MenuItemVariant[];
  addons?: MenuItemAddon[];
  created_at: string;
  updated_at: string;
}

// Table types
export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: "free" | "running" | "reserved" | "cleaning";
  current_order_id?: number;
  current_order_number?: string;
  current_order_status?: string;
  created_at: string;
  updated_at: string;
}

// Customer types
export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

// Order types
export interface OrderItemVariant {
  id?: number;
  order_item_id?: number;
  variant_name: string;
  variant_value: string;
  price_modifier?: number;
}

export interface OrderItemAddon {
  id?: number;
  order_item_id?: number;
  addon_name: string;
  addon_price: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item_name?: string;
  menu_item_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  status: "pending" | "preparing" | "ready" | "served" | "cancelled";
  variants?: OrderItemVariant[];
  addons?: OrderItemAddon[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  table_id?: number;
  table_number?: number;
  customer_id?: number;
  customer_name?: string;
  user_id?: number;
  user_name?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "draft" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  payment_status: "pending" | "paid" | "refunded";
  payment_method?: "cash" | "card" | "upi" | "other";
  notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  table_id?: number;
  customer_id?: number;
  user_id?: number;
  items: {
    menu_item_id: number;
    quantity: number;
    variants?: Array<{ name: string; value: string; price_modifier?: number }>;
    addons?: Array<{ name: string; price: number }>;
    notes?: string;
    status?: string;
  }[];
  tax_rate?: number;
  discount?: number;
  notes?: string;
}

// Inventory types
export interface InventoryItem {
  id: number;
  name: string;
  category?: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  unit_price: number;
  supplier?: string;
  last_restocked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: number;
  inventory_item_id: number;
  inventory_item_name?: string;
  type: "in" | "out" | "adjustment" | "waste";
  quantity: number;
  reason?: string;
  reference_id?: number;
  reference_type?: string;
  notes?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
}

// Analytics types
export interface Analytics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  peakHour: string;
  topItems: Array<{
    id: number;
    name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    total_sales: number;
    total_quantity: number;
  }>;
  dailySales: Array<{
    date: string;
    order_count: number;
    total_sales: number;
  }>;
  tableUtilization: Array<{
    number: number;
    order_count: number;
    total_sales: number;
  }>;
}

// Expense types
export interface Expense {
  id: number;
  date: string;
  category: 'rent' | 'electricity' | 'water' | 'gas' | 'salary' | 'supplies' | 'maintenance' | 'marketing' | 'transportation' | 'other';
  description: string;
  amount: number;
  payment_method?: 'cash' | 'card' | 'upi' | 'other';
  notes?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfitAnalysis {
  period: string;
  dateFrom: string;
  dateTo: string;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  expensesByCategory: Array<{
    category: string;
    total: number;
  }>;
}
