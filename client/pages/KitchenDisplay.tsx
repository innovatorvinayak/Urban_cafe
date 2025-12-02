import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getRelativeTimeIST } from '@/lib/dateUtils';

const statusConfig = {
  pending: { color: 'bg-red-100 text-red-800', label: '🔴 Pending', icon: '📋' },
  preparing: { color: 'bg-yellow-100 text-yellow-800', label: '🟡 Preparing', icon: '👨‍🍳' },
  ready: { color: 'bg-green-100 text-green-800', label: '🟢 Ready', icon: '✅' },
};

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      // Fetch active orders (not completed or cancelled)
      const allOrders = await apiService.getOrders();
      const activeOrders = Array.isArray(allOrders) 
        ? allOrders.filter((o: any) => 
            o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready'
          )
        : [];
      setOrders(activeOrders);
    } catch (error) {
      console.error('Failed to load kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadOrders();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      // Reload orders after status change
      await loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  const getTimeElapsed = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    return `${minutes}m ago`;
  };

  const groupedOrders = {
    pending: orders.filter((o) => o.status === 'confirmed' || o.status === 'pending'),
    preparing: orders.filter((o) => o.status === 'preparing'),
    ready: orders.filter((o) => o.status === 'ready'),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kitchen Display System</h1>
          <p className="text-muted-foreground">Real-time order tracking</p>
        </div>
        <Button
          variant={autoRefresh ? 'default' : 'outline'}
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          {autoRefresh ? '🔄 Auto Refresh' : '⏸️ Manual'}
        </Button>
      </div>

      {/* Orders by Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="space-y-4">
            <div className={cn('p-3 rounded-lg', config.color)}>
              <p className="font-bold text-lg">{config.label}</p>
              <p className="text-sm">{groupedOrders[status as keyof typeof groupedOrders].length} orders</p>
            </div>

            <div className="space-y-3">
              {groupedOrders[status as keyof typeof groupedOrders].map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-lg">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.table_number ? `Table ${order.table_number}` : order.customer_name || 'Walk-in'}
                        </p>
                      </div>
                      <span className="text-2xl">{config.icon}</span>
                    </div>

                    {/* Items */}
                    <div className="bg-muted p-2 rounded text-sm space-y-1">
                      {(order.items || []).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.menu_item_name || item.name}</span>
                          <span className="font-bold">×{item.quantity}</span>
                        </div>
                      ))}
                      {(!order.items || order.items.length === 0) && (
                        <p className="text-muted-foreground text-xs">No items</p>
                      )}
                    </div>

                    {/* Time Elapsed */}
                    <p className="text-xs text-muted-foreground">
                      {getRelativeTimeIST(order.created_at)}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {status === 'pending' && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusChange(order.id, 'preparing')}
                        >
                          Start
                        </Button>
                      )}
                      {status === 'preparing' && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusChange(order.id, 'ready')}
                        >
                          Ready
                        </Button>
                      )}
                      {status === 'ready' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            setOrders((prev) =>
                              prev.filter((o) => o.id !== order.id)
                            )
                          }
                        >
                          Served
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {groupedOrders[status as keyof typeof groupedOrders].length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  No orders
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
