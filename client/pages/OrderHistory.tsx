import { useEffect, useState } from 'react';
import { apiService, type Order } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Download, Filter, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { toISTDateString, toISTDateTimeString } from '@/lib/dateUtils';

export default function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await apiService.getOrders();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = orders.filter((order: any) => {
      const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.id?.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const handleDownloadInvoice = (orderId: string) => {
    const element = document.createElement('a');
    const file = new Blob(
      [
        `Invoice\n\nOrder ID: ${orderId}\nDate: ${toISTDateTimeString(new Date())}\n\nThank you for your purchase!`,
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `invoice-${orderId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCompleteOrder = async (orderId: number) => {
    if (!confirm('Mark this order as completed?')) return;
    
    try {
      await apiService.updateOrderStatus(orderId, 'completed');
      await loadOrders();
    } catch (error) {
      console.error('Failed to complete order:', error);
      alert('Failed to complete order');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Cancel this order? This action cannot be undone.')) return;
    
    try {
      await apiService.updateOrderStatus(orderId, 'cancelled');
      await loadOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order');
    }
  };

  const handleRefundOrder = async (orderId: number) => {
    if (!confirm('Issue a refund for this order?')) return;
    
    try {
      await apiService.updatePaymentStatus(orderId, 'refunded', null);
      await loadOrders();
    } catch (error) {
      console.error('Failed to refund order:', error);
      alert('Failed to refund order');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Order History</h1>
        <p className="text-muted-foreground">View and manage past orders</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  className="capitalize"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? <Filter className="w-4 h-4 mr-2" /> : null}
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Total: {filteredOrders.length} orders</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Order #</th>
                    <th className="text-left py-3 px-4 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold">Items</th>
                    <th className="text-left py-3 px-4 font-semibold">Total</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Order Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Payment</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order: any) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{order.order_number}</td>
                        <td className="py-3 px-4">{order.customer_name || 'Walk-in'}</td>
                        <td className="py-3 px-4">{order.items?.length || 0} items</td>
                        <td className="py-3 px-4 font-bold">₹{Number(order.total || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {toISTDateString(order.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                            order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            order.payment_status === 'refunded' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.payment_status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedOrder(order)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {order.status !== 'completed' && order.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleCompleteOrder(order.id)}
                                title="Complete Order"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {order.status !== 'cancelled' && order.status !== 'completed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleCancelOrder(order.id)}
                                title="Cancel Order"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {(order.status === 'completed' || order.status === 'cancelled') && 
                             order.payment_status !== 'refunded' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() => handleRefundOrder(order.id)}
                                title="Refund Order"
                              >
                                <DollarSign className="w-4 h-4" />
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadInvoice(order.order_number)}
                              title="Download Invoice"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <Card
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>{selectedOrder.order_number}</CardTitle>
              <CardDescription>
                {toISTDateTimeString(selectedOrder.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="text-lg font-bold">{selectedOrder.customer_name || 'Walk-in'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="text-lg font-bold capitalize">{selectedOrder.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Status</p>
                  <p className={`text-lg font-bold capitalize ${
                    selectedOrder.status === 'completed' ? 'text-green-600' :
                    selectedOrder.status === 'cancelled' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <p className={`text-lg font-bold capitalize ${
                    selectedOrder.payment_status === 'paid' ? 'text-green-600' :
                    selectedOrder.payment_status === 'refunded' ? 'text-orange-600' :
                    'text-gray-600'
                  }`}>{selectedOrder.payment_status || 'pending'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-semibold mb-3">Order Items</p>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between p-2 bg-muted rounded"
                    >
                      <div className="flex-1">
                        <span className="font-medium">{item.menu_item_name || item.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-bold">₹{Number(item.total_price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No items</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{Number(selectedOrder.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>₹{Number(selectedOrder.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-primary">₹{Number(selectedOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                    <Button
                      className="flex-1"
                      variant="default"
                      onClick={async () => {
                        await handleCompleteOrder(selectedOrder.id);
                        setSelectedOrder(null);
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Order
                    </Button>
                  )}
                  
                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed' && (
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={async () => {
                        await handleCancelOrder(selectedOrder.id);
                        setSelectedOrder(null);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>
                
                {(selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled') && 
                 selectedOrder.payment_status !== 'refunded' && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={async () => {
                      await handleRefundOrder(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Issue Refund
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => handleDownloadInvoice(selectedOrder.order_number)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Invoice
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
