import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['admin', 'manager', 'cashier', 'kitchen'] },
  { label: 'POS Orders', path: '/pos', icon: '🛒', roles: ['admin', 'manager', 'cashier'] },
  { label: 'Table Management', path: '/tables', icon: '🪑', roles: ['admin', 'manager', 'cashier'] },
  { label: 'Orders', path: '/orders', icon: '📦', roles: ['admin', 'manager', 'cashier', 'kitchen'] },
  { label: 'Menu', path: '/menu', icon: '📋', roles: ['admin', 'manager'] },
  { label: 'Inventory', path: '/inventory', icon: '📦', roles: ['admin', 'manager'] },
  { label: 'Customers', path: '/customers', icon: '👥', roles: ['admin', 'manager'] },
  { label: 'Expenses & Profit', path: '/expenses', icon: '💰', roles: ['admin'] },
  { label: 'Reports', path: '/reports', icon: '📈', roles: ['admin', 'manager'] },
  { label: 'Settings', path: '/settings', icon: '⚙️', roles: ['admin', 'manager', 'cashier', 'kitchen'] },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useAppStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 w-64',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold text-lg">
              ☕
            </div>
            <span className="font-bold text-lg hidden md:inline">Urban Cafe</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {navItems
              .filter((item) => !item.roles || item.roles.includes(user?.role || ''))
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
          </nav>

          {/* Footer */}
          <div className="space-y-2 border-t border-sidebar-border pt-4 mt-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {theme === 'light' ? 'Dark' : 'Light'} Mode
              </span>
            </button>

            {/* User Info & Logout */}
            <div className="px-4 py-2 rounded-lg bg-sidebar-accent">
              <p className="text-xs text-sidebar-foreground opacity-75">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground opacity-50 capitalize">
                {user?.role}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <div className="fixed top-4 left-4 md:hidden z-40">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 overflow-auto">
        {children}
      </main>
    </div>
  );
}
