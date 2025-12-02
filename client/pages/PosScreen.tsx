import { useEffect, useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { apiService, type MenuItem, type Category } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { POSGridSkeleton } from '@/components/LoadingSkeleton';

export default function PosScreen() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { cart, addToCart, removeFromCart, updateCartQuantity, getCartTotal, getCartSubtotal } = useOrderStore();
  const navigate = useNavigate();

  // Use React Query for caching
  const { data: menuItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const items = await apiService.getMenuItems();
      return items.map(item => ({
        ...item,
        price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0') || 0,
      }));
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  const loading = loadingItems || loadingCategories;

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const filteredItems = selectedCategoryId
    ? menuItems.filter(item => item.category_id === selectedCategoryId)
    : menuItems;

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id.toString(),
      menuItemId: item.id.toString(),
      name: item.name,
      price: Number(item.price || 0),
      quantity: quantity,
      image: item.image || '🍽️',
      category: item.category_name || '',
      isAvailable: item.is_available,
    }, quantity);
    setQuantity(1);
    setSelectedItem(null);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Left Sidebar - Categories */}
      <div className="hidden lg:flex w-32 flex-col border-r border-border bg-card p-4 space-y-2 overflow-y-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategoryId(category.id)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              selectedCategoryId === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Main Content - Menu Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {categories.find(c => c.id === selectedCategoryId)?.name || 'All Items'}
          </h2>
          <p className="text-muted-foreground">Select items to add to cart</p>
        </div>

        {loading ? (
          <POSGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedItem(item)}
              >
                <CardContent className="p-4">
                  <div className="text-4xl mb-2 text-center">{item.image || '🍽️'}</div>
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {item.description?.split('\n')[0] || ''}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">₹{Number(item.price || 0).toFixed(2)}</span>
                    {!item.is_available && <span className="text-xs text-destructive">Out</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar - Cart */}
      <div className="w-80 border-l border-border bg-card flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-lg">Order Cart</h3>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No items in cart</div>
          ) : (
            cart.map((item) => (
              <div key={item.menuItemId} className="bg-muted p-3 rounded space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{Number(item.price || 0).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.menuItemId)}
                    className="text-destructive hover:bg-destructive/10 p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartQuantity(item.menuItemId, item.quantity - 1)}
                    className="p-1 hover:bg-background rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.menuItemId, item.quantity + 1)}
                    className="p-1 hover:bg-background rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{getCartSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>₹{(getCartSubtotal() * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total:</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>
          </div>
          <Button
            onClick={handleCheckout}
            className="w-full"
            size="lg"
            disabled={cart.length === 0}
          >
            Checkout
          </Button>
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedItem(null)}
        >
          <Card
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>{selectedItem.name}</CardTitle>
              <CardDescription>{selectedItem.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-6xl text-center">{selectedItem.image}</div>
              <p className="text-center text-2xl font-bold text-primary">
                ₹{Number(selectedItem.price || 0).toFixed(2)}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-muted rounded"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-muted rounded"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleAddToCart(selectedItem)}
                >
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
