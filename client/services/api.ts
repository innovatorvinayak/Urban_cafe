import type {
  MenuItem,
  Category,
  Order,
  CreateOrderRequest,
  Table,
  Customer,
  InventoryItem,
  InventoryTransaction,
  Analytics,
  LoginResponse,
  User,
} from "@shared/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Mock Data (for backward compatibility)
export const mockMenuItems: MenuItem[] = [];
export const mockOrders: Order[] = [];
export const mockTables: Table[] = [];
export const mockInventory: InventoryItem[] = [];
export const mockAnalytics: Analytics = {
  totalSales: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  peakHour: "--",
  topItems: [],
  salesByCategory: [],
  dailySales: [],
  tableUtilization: [],
};

// API Service Functions
export const apiService = {
  // Authentication
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiCall<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiCall<User>("/auth/me");
  },

  resetPassword: async (email: string) => {
    // TODO: Implement password reset endpoint
    return { message: "Password reset link sent to " + email };
  },

  // Menu
  getCategories: async (): Promise<Category[]> => {
    return apiCall<Category[]>("/menu/categories");
  },

  createCategory: async (category: Partial<Category>): Promise<Category> => {
    return apiCall<Category>("/menu/categories", {
      method: "POST",
      body: JSON.stringify(category),
    });
  },

  getMenuItems: async (categoryId?: number): Promise<MenuItem[]> => {
    const params = categoryId ? `?category_id=${categoryId}` : "";
    return apiCall<MenuItem[]>(`/menu/items${params}`);
  },

  getMenuByCategory: async (category: string): Promise<MenuItem[]> => {
    // First get category ID
    const categories = await apiService.getCategories();
    const categoryObj = categories.find((c) => c.name === category);
    if (!categoryObj) return [];
    return apiService.getMenuItems(categoryObj.id);
  },

  getMenuItemById: async (id: number): Promise<MenuItem> => {
    return apiCall<MenuItem>(`/menu/items/${id}`);
  },

  createMenuItem: async (item: Partial<MenuItem>): Promise<MenuItem> => {
    return apiCall<MenuItem>("/menu/items", {
      method: "POST",
      body: JSON.stringify(item),
    });
  },

  updateMenuItem: async (id: number, item: Partial<MenuItem>): Promise<MenuItem> => {
    return apiCall<MenuItem>(`/menu/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
  },

  deleteMenuItem: async (id: number): Promise<void> => {
    return apiCall<void>(`/menu/items/${id}`, {
      method: "DELETE",
    });
  },

  // Orders
  getOrders: async (filters?: {
    status?: string;
    table_id?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.table_id) params.append("table_id", filters.table_id.toString());
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);

    const queryString = params.toString();
    return apiCall<Order[]>(`/orders${queryString ? `?${queryString}` : ""}`);
  },

  getOrderById: async (id: number): Promise<Order> => {
    return apiCall<Order>(`/orders/${id}`);
  },

  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    return apiCall<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
    return apiCall<Order>(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  updateOrderItemStatus: async (
    orderId: number,
    itemId: number,
    status: string
  ): Promise<any> => {
    return apiCall<any>(`/orders/${orderId}/items/${itemId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  updatePaymentStatus: async (
    orderId: number,
    paymentStatus: string,
    paymentMethod?: string
  ): Promise<Order> => {
    return apiCall<Order>(`/orders/${orderId}/payment`, {
      method: "PUT",
      body: JSON.stringify({
        payment_status: paymentStatus,
        payment_method: paymentMethod,
      }),
    });
  },

  // Tables
  getTables: async (): Promise<Table[]> => {
    return apiCall<Table[]>("/tables");
  },

  getTableById: async (id: number): Promise<Table> => {
    return apiCall<Table>(`/tables/${id}`);
  },

  createTable: async (table: Partial<Table>): Promise<Table> => {
    return apiCall<Table>("/tables", {
      method: "POST",
      body: JSON.stringify(table),
    });
  },

  updateTable: async (id: number, table: Partial<Table>): Promise<Table> => {
    return apiCall<Table>(`/tables/${id}`, {
      method: "PUT",
      body: JSON.stringify(table),
    });
  },

  updateTableStatus: async (tableId: number, status: string): Promise<Table> => {
    return apiCall<Table>(`/tables/${tableId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  deleteTable: async (id: number): Promise<void> => {
    return apiCall<void>(`/tables/${id}`, {
      method: "DELETE",
    });
  },

  // Inventory
  getInventory: async (filters?: {
    category?: string;
    low_stock?: boolean;
  }): Promise<InventoryItem[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.low_stock) params.append("low_stock", "true");

    const queryString = params.toString();
    return apiCall<InventoryItem[]>(`/inventory${queryString ? `?${queryString}` : ""}`);
  },

  getInventoryItemById: async (id: number): Promise<InventoryItem> => {
    return apiCall<InventoryItem>(`/inventory/${id}`);
  },

  createInventoryItem: async (item: Partial<InventoryItem>): Promise<InventoryItem> => {
    return apiCall<InventoryItem>("/inventory", {
      method: "POST",
      body: JSON.stringify(item),
    });
  },

  updateInventoryItem: async (
    id: number,
    item: Partial<InventoryItem>
  ): Promise<InventoryItem> => {
    return apiCall<InventoryItem>(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
  },

  updateInventoryQuantity: async (
    itemId: number,
    quantity: number,
    type?: "in" | "out" | "adjustment" | "waste",
    reason?: string
  ): Promise<InventoryItem> => {
    return apiCall<InventoryItem>(`/inventory/${itemId}/quantity`, {
      method: "PUT",
      body: JSON.stringify({ quantity, type, reason }),
    });
  },

  getInventoryTransactions: async (
    inventoryItemId?: number,
    filters?: {
      type?: string;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<InventoryTransaction[]> => {
    const params = new URLSearchParams();
    if (inventoryItemId) params.append("inventory_item_id", inventoryItemId.toString());
    if (filters?.type) params.append("type", filters.type);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);

    const queryString = params.toString();
    return apiCall<InventoryTransaction[]>(
      `/inventory/${inventoryItemId || ""}/transactions${queryString ? `?${queryString}` : ""}`
    );
  },

  deleteInventoryItem: async (id: number): Promise<void> => {
    return apiCall<void>(`/inventory/${id}`, {
      method: "DELETE",
    });
  },

  // Customers
  getCustomers: async (search?: string): Promise<Customer[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiCall<Customer[]>(`/customers${params}`);
  },

  getCustomerById: async (id: number): Promise<Customer> => {
    return apiCall<Customer>(`/customers/${id}`);
  },

  createCustomer: async (customer: Partial<Customer>): Promise<Customer> => {
    return apiCall<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    });
  },

  updateCustomer: async (id: number, customer: Partial<Customer>): Promise<Customer> => {
    return apiCall<Customer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customer),
    });
  },

  deleteCustomer: async (id: number): Promise<void> => {
    return apiCall<void>(`/customers/${id}`, {
      method: "DELETE",
    });
  },

  // Analytics
  getAnalytics: async (dateRange?: { from: Date; to: Date }): Promise<Analytics> => {
    const params = new URLSearchParams();
    if (dateRange?.from) {
      params.append("date_from", dateRange.from.toISOString().split("T")[0]);
    }
    if (dateRange?.to) {
      params.append("date_to", dateRange.to.toISOString().split("T")[0]);
    }

    const queryString = params.toString();
    return apiCall<Analytics>(`/analytics${queryString ? `?${queryString}` : ""}`);
  },

  // Expenses
  getExpenses: async (filters?: {
    date_from?: string;
    date_to?: string;
    category?: string;
  }): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.category) params.append("category", filters.category);

    const queryString = params.toString();
    return apiCall<any[]>(`/expenses${queryString ? `?${queryString}` : ""}`);
  },

  createExpense: async (expense: any): Promise<any> => {
    return apiCall<any>("/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    });
  },

  updateExpense: async (id: number, expense: any): Promise<any> => {
    return apiCall<any>(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(expense),
    });
  },

  deleteExpense: async (id: number): Promise<void> => {
    return apiCall<void>(`/expenses/${id}`, {
      method: "DELETE",
    });
  },

  getProfitAnalysis: async (period: string = 'week'): Promise<any> => {
    return apiCall<any>(`/expenses/profit?period=${period}`);
  },
};

export default apiService;
