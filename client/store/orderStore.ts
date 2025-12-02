import { create } from 'zustand';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
  isAvailable: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  addons?: { name: string; price: number }[];
  variants?: { name: string; value: string }[];
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  tableNumber?: number;
  customerName?: string;
  status: 'draft' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
}

interface OrderState {
  cart: OrderItem[];
  currentOrder: Order | null;
  addToCart: (item: MenuItem, quantity: number, addons?: any[], variants?: any[]) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  createOrder: (order: Order) => void;
  clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  cart: [],
  currentOrder: null,
  
  addToCart: (item, quantity, addons = [], variants = []) => {
    const existing = get().cart.find(i => i.menuItemId === item.id);
    
    if (existing) {
      set((state) => ({
        cart: state.cart.map(i =>
          i.menuItemId === item.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
      }));
    } else {
      set((state) => ({
        cart: [
          ...state.cart,
          {
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity,
            addons,
            variants,
          },
        ],
      }));
    }
  },
  
  removeFromCart: (menuItemId) => {
    set((state) => ({
      cart: state.cart.filter(i => i.menuItemId !== menuItemId),
    }));
  },
  
  updateCartQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(menuItemId);
      return;
    }
    
    set((state) => ({
      cart: state.cart.map(i =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      ),
    }));
  },
  
  clearCart: () => set({ cart: [] }),
  
  getCartSubtotal: () => {
    const cart = get().cart;
    return cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const addonsTotal = (item.addons || []).reduce((acc, addon) => acc + addon.price, 0) * item.quantity;
      return sum + itemTotal + addonsTotal;
    }, 0);
  },
  
  getCartTotal: () => {
    const subtotal = get().getCartSubtotal();
    const tax = subtotal * 0.1; // 10% tax
    return subtotal + tax;
  },
  
  createOrder: (order) => set({ currentOrder: order }),
  clearCurrentOrder: () => set({ currentOrder: null }),
}));
