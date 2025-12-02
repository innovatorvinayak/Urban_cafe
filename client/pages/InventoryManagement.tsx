import { useState } from 'react';
import { apiService, type InventoryItem, type InventoryTransaction } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Plus, Minus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { getRelativeTimeIST } from '@/lib/dateUtils';

export default function InventoryManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState(0);

  // Use React Query for caching
  const { data: inventory = [], isLoading: loading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => apiService.getInventory(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });

  // Fetch recent inventory transactions
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['inventoryTransactions'],
    queryFn: () => apiService.getInventoryTransactions(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(
    (item) => item.current_stock <= item.min_stock
  );

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      await apiService.updateInventoryQuantity(itemId, quantity, 'adjustment', 'Manual update');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryTransactions'] });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity');
    }
  };

  const handleRestock = async (item: InventoryItem) => {
    // Set suggested quantity and show dialog
    const suggestedQty = Math.max(item.min_stock * 2, 10);
    setRestockQuantity(suggestedQty);
    setRestockingItem(item);
  };

  const confirmRestock = async () => {
    if (!restockingItem || restockQuantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      await apiService.updateInventoryQuantity(restockingItem.id, restockQuantity, 'in', 'Restock');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryTransactions'] });
      setRestockingItem(null);
      setRestockQuantity(0);
    } catch (error) {
      console.error('Failed to restock:', error);
      alert('Failed to restock item');
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'in': return 'Restocked';
      case 'out': return 'Used';
      case 'adjustment': return 'Adjusted';
      case 'waste': return 'Wasted';
      default: return 'Updated';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'in': return '+';
      case 'out': return '-';
      case 'waste': return '-';
      default: return '±';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">Track stock levels and manage supplies</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-orange-800">Low Stock Alert</p>
              <p className="text-sm text-orange-700">
                {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} are low on stock
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Items</CardTitle>
          <CardDescription>Total items: {filteredInventory.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Item Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Current Stock</th>
                    <th className="text-left py-3 px-4 font-semibold">Min Level</th>
                    <th className="text-left py-3 px-4 font-semibold">Unit</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{item.name}</td>
                      <td className="py-3 px-4">
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            value={newQuantity}
                            onChange={(e) =>
                              setNewQuantity(parseFloat(e.target.value))
                            }
                            className="w-20"
                            autoFocus
                          />
                        ) : (
                          <span className="font-bold">{item.current_stock}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{item.min_stock}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {item.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.current_stock <= item.min_stock
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {item.current_stock <= item.min_stock
                            ? 'Low Stock'
                            : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {editingId === item.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateQuantity(item.id, newQuantity)
                                }
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingId(item.id);
                                  setNewQuantity(item.current_stock);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleRestock(item)}
                              >
                                <Plus className="w-4 h-4" />
                                Restock
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Stock updates and restocking history (Last 10)</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="text-center py-4 text-muted-foreground">Loading activity...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{transaction.inventory_item_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{getRelativeTimeIST(transaction.created_at)}</span>
                      {transaction.reason && (
                        <>
                          <span>•</span>
                          <span>{transaction.reason}</span>
                        </>
                      )}
                      {transaction.created_by_name && (
                        <>
                          <span>•</span>
                          <span>by {transaction.created_by_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold capitalize ${
                      transaction.type === 'in' ? 'text-green-600' :
                      transaction.type === 'out' ? 'text-red-600' :
                      transaction.type === 'waste' ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>
                      {getActionLabel(transaction.type)}
                    </p>
                    <p className={`text-sm font-medium ${
                      transaction.type === 'in' ? 'text-green-600' :
                      transaction.type === 'out' || transaction.type === 'waste' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {getActionIcon(transaction.type)}{transaction.quantity} {inventory.find((i: any) => i.id === transaction.inventory_item_id)?.unit || 'units'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restock Dialog */}
      {restockingItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setRestockingItem(null)}
        >
          <Card
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>Restock Item</CardTitle>
              <CardDescription>{restockingItem.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded">
                <div>
                  <p className="text-xs text-muted-foreground">Current Stock</p>
                  <p className="text-lg font-bold">{restockingItem.current_stock} {restockingItem.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Min Stock</p>
                  <p className="text-lg font-bold">{restockingItem.min_stock} {restockingItem.unit}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="restock-qty">Quantity to Add</Label>
                <div className="flex gap-2 items-center mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setRestockQuantity(Math.max(0, restockQuantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    id="restock-qty"
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(parseFloat(e.target.value) || 0)}
                    className="text-center text-lg font-bold"
                    min="0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setRestockQuantity(restockQuantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  New stock will be: {restockingItem.current_stock + restockQuantity} {restockingItem.unit}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={confirmRestock}
                  disabled={restockQuantity <= 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Confirm Restock
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setRestockingItem(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
