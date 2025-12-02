# Backend Setup Guide

This guide will help you set up the MySQL database backend for the Zenith Garden Restaurant POS System.

## Prerequisites

1. Node.js and npm/pnpm installed
2. MySQL database access (credentials provided)
3. Database server accessible

## Database Configuration

The database credentials are already configured in the code. You can override them using environment variables:

```env
DB_CONNECTION=mysql
DB_HOST=35.226.2.229
DB_PORT=3306
DB_DATABASE=UC
DB_USERNAME=creatorsjam
DB_PASSWORD=RLvEGam6O79wGkeZVaxsCu85rjhBWR
DB_CHARSET=utf8
DB_COLLATION=utf8_general_ci
```

## Installation

1. Install dependencies:
```bash
pnpm install
# or
npm install
```

2. Install MySQL2 package (if not already installed):
```bash
pnpm add mysql2
# or
npm install mysql2
```

## Database Schema Setup

The database schema is defined in `server/db/schema.sql`. To initialize the database:

### Option 1: Using MySQL Client

Run the SQL file directly using MySQL client:

```bash
mysql -h 35.226.2.229 -u creatorsjam -p UC < server/db/schema.sql
```

When prompted, enter the password: `RLvEGam6O79wGkeZVaxsCu85rjhBWR`

### Option 2: Using Node.js Script

```bash
pnpm run db:init
# or
npm run db:init
```

## Database Schema Overview

The database includes the following tables:

1. **users** - User authentication and roles
2. **categories** - Menu item categories
3. **menu_items** - Menu items/products
4. **menu_item_variants** - Variants (size, type, etc.)
5. **menu_item_addons** - Add-ons/extras
6. **tables** - Restaurant tables
7. **customers** - Customer information
8. **orders** - Order records
9. **order_items** - Individual items in orders
10. **order_item_variants** - Variants for order items
11. **order_item_addons** - Add-ons for order items
12. **inventory_items** - Inventory stock items
13. **inventory_transactions** - Inventory movement history
14. **menu_item_ingredients** - Ingredients for menu items
15. **settings** - System settings

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Menu
- `GET /api/menu/categories` - Get all categories
- `POST /api/menu/categories` - Create category
- `GET /api/menu/items` - Get all menu items (optional: `?category_id=X`)
- `GET /api/menu/items/:id` - Get menu item by ID
- `POST /api/menu/items` - Create menu item
- `PUT /api/menu/items/:id` - Update menu item
- `DELETE /api/menu/items/:id` - Delete menu item

### Orders
- `GET /api/orders` - Get all orders (optional filters: `?status=X&table_id=Y&date_from=Z&date_to=W`)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:orderId/items/:itemId/status` - Update order item status
- `PUT /api/orders/:id/payment` - Update payment status

### Tables
- `GET /api/tables` - Get all tables
- `GET /api/tables/:id` - Get table by ID
- `POST /api/tables` - Create table
- `PUT /api/tables/:id` - Update table
- `PUT /api/tables/:id/status` - Update table status
- `DELETE /api/tables/:id` - Delete table

### Inventory
- `GET /api/inventory` - Get all inventory items (optional: `?category=X&low_stock=true`)
- `GET /api/inventory/:id` - Get inventory item by ID
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `PUT /api/inventory/:id/quantity` - Update inventory quantity
- `GET /api/inventory/:id/transactions` - Get inventory transactions
- `DELETE /api/inventory/:id` - Delete inventory item

### Customers
- `GET /api/customers` - Get all customers (optional: `?search=X`)
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Analytics
- `GET /api/analytics` - Get analytics data (optional: `?date_from=X&date_to=Y`)

## Default Data

The schema includes default data:
- Default categories: Coffee, Tea, Beverages, Food, Desserts
- Default admin user: `admin@restaurant.com` / `admin123`
- Default settings: tax_rate (10%), currency (INR), restaurant_name

## Development

Start the development server:

```bash
pnpm dev
# or
npm run dev
```

The server will run on port 8080 (or the port specified in your configuration).

## Frontend Integration

The frontend API service (`client/services/api.ts`) is already configured to use the backend endpoints. The API base URL defaults to `/api` which works with the integrated Express server.

## Testing the Backend

1. Start the development server
2. Test the ping endpoint: `GET http://localhost:8080/api/ping`
3. Test menu items: `GET http://localhost:8080/api/menu/items`
4. Test tables: `GET http://localhost:8080/api/tables`

## Production Considerations

1. **Password Hashing**: Currently passwords are stored in plain text. In production, use bcrypt or similar.
2. **JWT Authentication**: Implement proper JWT token generation and validation.
3. **Error Handling**: Add comprehensive error handling and logging.
4. **Input Validation**: Add input validation using Zod schemas.
5. **Rate Limiting**: Add rate limiting to prevent abuse.
6. **CORS**: Configure CORS properly for production domains.
7. **Database Connection Pooling**: Already configured, but tune based on load.

## Troubleshooting

### Connection Issues
- Verify database credentials
- Check network connectivity to database server
- Ensure database exists and user has proper permissions

### Schema Errors
- Make sure all tables are created
- Check for foreign key constraints
- Verify default data is inserted

### API Errors
- Check server logs for detailed error messages
- Verify request format matches API documentation
- Ensure required fields are provided

## Support

For issues or questions, refer to the main project documentation or contact the development team.

