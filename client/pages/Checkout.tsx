import { useOrderStore } from '@/store/orderStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { apiService } from '@/services/api';

export default function Checkout() {
  const { cart, getCartTotal, getCartSubtotal, clearCart } = useOrderStore();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const subtotal = getCartSubtotal();
  const tax = subtotal * 0.1;
  const total = getCartTotal();

  const handlePayment = async () => {
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    setIsProcessing(true);

    try {
      const order = await apiService.createOrder({
        items: cart,
        subtotal,
        tax,
        total,
        customerName,
        paymentMethod,
        status: 'confirmed',
      });

      setOrderConfirmed(true);
      clearCart();

      setTimeout(() => {
        navigate('/pos');
      }, 2000);
    } catch (error) {
      alert('Error processing payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !orderConfirmed) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate('/pos')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to POS
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Cart is empty</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderConfirmed) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Order Confirmed!</h2>
            <p className="text-muted-foreground">
              Your order has been successfully placed and sent to the kitchen.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to POS screen...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate('/pos')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to POS
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="flex items-center justify-between p-3 bg-muted rounded"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <span className="font-bold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer-name">Customer Name</Label>
                <Input
                  id="customer-name"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@email.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Section */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { value: 'cash', label: '💵 Cash' },
                  { value: 'card', label: '💳 Card' },
                  { value: 'digital', label: '📱 Digital Wallet' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="rounded-full"
                    />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="text-center mb-4">
                  <p className="text-muted-foreground text-sm mb-2">Total Amount</p>
                  <p className="text-3xl font-bold text-primary">
                    ₹{total.toFixed(2)}
                  </p>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-12 text-lg"
                >
                  {isProcessing ? 'Processing...' : 'Complete Payment'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/pos')}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
