# Urban Cafe - Complete POS & Restaurant Management System

A modern, full-stack Point of Sale (POS) system for cafes and restaurants with comprehensive management features.

## 🚀 Features

### Customer-Facing
- **Fast POS Interface** - Quick order entry with category-based navigation
- **Menu Display** - 45+ items including Maggi, Sandwiches, Pizzas, Chai, Coffee, Drinks
- **Real-time Cart** - Live cart with totals and tax calculation
- **Multiple Payment Methods** - Cash, Card, UPI support

### Management Features
- **Menu Management** - Add, edit, delete menu items with Hindi recipe support
- **Inventory Tracking** - 69+ ingredients with bilingual names (English/Hindi)
- **Order Management** - View, complete, cancel, refund orders
- **Customer Database** - Track customer information
- **Expenses & Profit** - Financial tracking with weekly/monthly/quarterly analysis (Admin only)
- **Analytics & Reports** - Sales trends, top items, revenue analysis
- **Table Management** - Track table status and assignments

### Role-Based Access
- **Admin**: Full access including financial reports
- **Manager**: All features except expenses
- **Cashier**: POS, orders, tables
- **Kitchen**: Order display and status updates

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express + Node.js
- **Database**: MySQL
- **Styling**: TailwindCSS + Radix UI
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Icons**: Lucide React
- **Charts**: Recharts

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Initialize database
pnpm db:init

# Seed database
pnpm db:seed:all

# Initialize expenses table
pnpm db:init:expenses

# Start development server
pnpm dev
```

## 🗄️ Database Setup

Configure your MySQL connection in `.env`:

```env
DB_HOST=your-host
DB_PORT=3306
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=UC
```

### Database Scripts

```bash
pnpm db:init                    # Initialize database schema
pnpm db:seed:all                # Seed all data (menu, inventory, users)
pnpm db:seed:menu               # Seed menu items only
pnpm db:seed:inventory:complete # Seed inventory with Hindi names
pnpm db:seed:users              # Seed user accounts
pnpm db:init:expenses           # Initialize expenses table
pnpm db:inventory:reset         # Reset all inventory stock to 0
pnpm db:clean:orders            # Clean all orders and expenses
```

## 👥 Default User Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@zenithgarden.com | admin123 |
| Manager | manager@zenithgarden.com | manager123 |
| Cashier | cashier@zenithgarden.com | cashier123 |
| Kitchen | kitchen@zenithgarden.com | kitchen123 |

## 📱 Pages

- `/login` - User authentication
- `/dashboard` - Overview with KPIs and recent orders
- `/pos` - POS order entry screen
- `/orders` - Order history and management
- `/menu` - Menu item management
- `/inventory` - Inventory tracking with transactions
- `/customers` - Customer database
- `/expenses` - Expenses & profit analysis (Admin only)
- `/reports` - Analytics and reports
- `/tables` - Table management
- `/settings` - System settings

## 🎨 Menu Items (45 items)

### Maggi (9) - ₹60-88
- Amritsari Butter Tadka, Dhaba Masala, Lahori Garlic, Tandoori, Cheese Burst, Garlic Cheese, Corn & Cheese, Paneer Cheese Masala, Peri-Peri Cheese

### Sandwiches (7) - ₹40-90
- Veg, Paneer Cheese, Tandoori, Plain, Cheese, Corn Cheese, Veg Grilled

### Magizza (6) - ₹85-140
- Classic Masala, Spicy Schezwan, Extra Cheese, Veggie Delight, Cheese Burst, Corn & Cheese

### Pizza (6) - ₹95-140
- Classic Masala, Spicy Schezwan, Extra Cheese, Veggie Delight, Cheese Burst, Corn & Cheese

### Chai (9) - ₹22-40
- Lemon, Masala, Caramel Masala, Elaichi, Caramel Elaichi, Normal, Caramel Normal, Adrak, Caramel Adrak

### Coffee (1) - ₹35
- Filter Coffee

### Drinks (6) - ₹40-77
- Classic Mojito, Mint Mojito, Orange Mojito, Lemon Mojito, Masala Lemonade, Shikanji

### Dessert (1) - ₹40
- Chocolate with Bread

## 📊 Inventory Categories

- Basic Ingredients (4 items)
- Spices & Masalas (12 items)
- Sauces (5 items)
- Dairy (8 items)
- Vegetables (14 items)
- Bakery (2 items)
- Beverages (12 items)
- Desserts (4 items)
- Packaging (6 items)

## ⚡ Performance Optimizations

- Database connection pooling (20 connections)
- Bulk queries (eliminated N+1 problem)
- React Query caching (5-10 min cache times)
- Lazy loading for non-critical pages
- Loading skeletons for better UX
- Database indexes on frequently queried columns

## 🌍 Localization

- All timestamps in IST (Indian Standard Time)
- Inventory items with Hindi names
- Recipe instructions in English and Hindi

## 🔒 Security Notes

⚠️ **Important**: This is a development setup with plain-text passwords. For production:
- Implement bcrypt password hashing
- Use JWT tokens for authentication
- Add HTTPS
- Implement proper session management
- Add rate limiting
- Validate all inputs

## 📝 License

Private - All rights reserved

## 👨‍💻 Author

Vinayak Tripathi

