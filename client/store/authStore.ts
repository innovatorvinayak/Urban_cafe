import { create } from 'zustand';
import { apiService } from '@/services/api';

export type UserRole = 'cashier' | 'kitchen' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  
  login: async (email: string, password: string) => {
    try {
      // Call the real backend API
      const response = await apiService.login(email, password);
      
      if (!response || !response.token || !response.user) {
        throw new Error('Invalid response from server');
      }

      const user: User = {
        id: response.user.id.toString(),
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as UserRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.email}`,
      };
      
      // Store token and user
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token: response.token, isAuthenticated: true });
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Invalid credentials');
    }
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  setUser: (user: User) => set({ user }),
}));

// Initialize user from localStorage on app load
const storedUser = localStorage.getItem('user');
if (storedUser) {
  try {
    const user = JSON.parse(storedUser);
    useAuthStore.setState({ user });
  } catch (error) {
    console.error('Failed to parse stored user:', error);
    localStorage.removeItem('user');
  }
}
