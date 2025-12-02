import { RequestHandler } from "express";
import { query } from "../db/connection";

// Get analytics data
export const getAnalytics: RequestHandler = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    const dateFrom = date_from || new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split('T')[0];
    const dateTo = date_to || new Date().toISOString().split('T')[0];

    // Total sales
    const salesResultArray = await query(
      `SELECT 
        COALESCE(SUM(total), 0) as total_sales,
        COUNT(*) as total_orders,
        COALESCE(AVG(total), 0) as average_order_value
      FROM orders
      WHERE status != 'cancelled'
        AND DATE(created_at) >= ?
        AND DATE(created_at) <= ?`,
      [dateFrom, dateTo]
    );
    const salesResult = Array.isArray(salesResultArray) && salesResultArray.length > 0 
      ? (salesResultArray as any[])[0] 
      : { total_sales: 0, total_orders: 0, average_order_value: 0 };

    // Sales by hour (peak hour)
    const hourlySalesArray = await query(
      `SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as order_count,
        SUM(total) as sales
      FROM orders
      WHERE status != 'cancelled'
        AND DATE(created_at) >= ?
        AND DATE(created_at) <= ?
      GROUP BY HOUR(created_at)
      ORDER BY order_count DESC
      LIMIT 1`,
      [dateFrom, dateTo]
    );

    const peakHour = Array.isArray(hourlySalesArray) && hourlySalesArray.length > 0
      ? `${(hourlySalesArray as any[])[0].hour}:00`
      : "--";

    // Top items
    const topItemsResult = await query(
      `SELECT 
        mi.name,
        mi.id,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
        AND DATE(o.created_at) >= ?
        AND DATE(o.created_at) <= ?
      GROUP BY mi.id, mi.name
      ORDER BY total_quantity DESC
      LIMIT 10`,
      [dateFrom, dateTo]
    );

    // Sales by category
    const salesByCategoryResult = await query(
      `SELECT 
        c.name as category,
        SUM(oi.total_price) as total_sales,
        SUM(oi.quantity) as total_quantity
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN categories c ON mi.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
        AND DATE(o.created_at) >= ?
        AND DATE(o.created_at) <= ?
      GROUP BY c.id, c.name
      ORDER BY total_sales DESC`,
      [dateFrom, dateTo]
    );

    // Daily sales trend
    const dailySalesResult = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total) as total_sales
      FROM orders
      WHERE status != 'cancelled'
        AND DATE(created_at) >= ?
        AND DATE(created_at) <= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [dateFrom, dateTo]
    );

    // Table utilization
    const tableUtilizationResult = await query(
      `SELECT 
        t.number,
        COUNT(o.id) as order_count,
        SUM(o.total) as total_sales
      FROM tables t
      LEFT JOIN orders o ON t.id = o.table_id
        AND DATE(o.created_at) >= ?
        AND DATE(o.created_at) <= ?
        AND o.status != 'cancelled'
      GROUP BY t.id, t.number
      ORDER BY total_sales DESC`,
      [dateFrom, dateTo]
    );

    // Transform topItems to match chart format
    const topItems = Array.isArray(topItemsResult) 
      ? (topItemsResult as any[]).map((item: any) => ({
          name: item.name,
          sales: parseFloat(item.total_revenue || 0),
        }))
      : [];

    const analytics = {
      totalSales: parseFloat(salesResult?.total_sales || 0),
      totalOrders: parseInt(salesResult?.total_orders || 0),
      averageOrderValue: parseFloat(salesResult?.average_order_value || 0),
      peakHour,
      topItems: topItems,
      salesByCategory: Array.isArray(salesByCategoryResult) ? (salesByCategoryResult as any[]) : [],
      dailySales: Array.isArray(dailySalesResult) ? (dailySalesResult as any[]) : [],
      tableUtilization: Array.isArray(tableUtilizationResult) ? (tableUtilizationResult as any[]) : [],
    };

    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

