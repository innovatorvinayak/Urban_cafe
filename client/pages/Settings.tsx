import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Printer } from 'lucide-react';

export default function Settings() {
  const [shopInfo, setShopInfo] = useState({
    name: 'The Daily Brew Cafe',
    address: '123 Coffee Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@dailybrew.com',
    website: 'www.dailybrew.com',
  });

  const [taxSettings, setTaxSettings] = useState({
    taxRate: 10,
    serviceFee: 0,
  });

  const [printerSettings, setPrinterSettings] = useState({
    kitchenPrinter: 'Printer-1',
    receiptPrinter: 'Printer-2',
    tablePrinter: 'None',
  });

  const [users, setUsers] = useState([
    { id: '1', name: 'Admin User', email: 'admin@cafe.com', role: 'admin' },
    { id: '2', name: 'Cashier 1', email: 'cashier@cafe.com', role: 'cashier' },
    { id: '3', name: 'Kitchen Staff', email: 'kitchen@cafe.com', role: 'kitchen' },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your cafe settings</p>
      </div>

      {/* Shop Information */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
          <CardDescription>Basic details about your cafe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shop-name">Shop Name</Label>
              <Input
                id="shop-name"
                value={shopInfo.name}
                onChange={(e) =>
                  setShopInfo({ ...shopInfo, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={shopInfo.email}
                onChange={(e) =>
                  setShopInfo({ ...shopInfo, email: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={shopInfo.address}
                onChange={(e) =>
                  setShopInfo({ ...shopInfo, address: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={shopInfo.phone}
                onChange={(e) =>
                  setShopInfo({ ...shopInfo, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={shopInfo.website}
                onChange={(e) =>
                  setShopInfo({ ...shopInfo, website: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Tax & Fees</CardTitle>
          <CardDescription>Configure tax rates and additional fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                value={taxSettings.taxRate}
                onChange={(e) =>
                  setTaxSettings({
                    ...taxSettings,
                    taxRate: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="service-fee">Service Fee (%)</Label>
              <Input
                id="service-fee"
                type="number"
                value={taxSettings.serviceFee}
                onChange={(e) =>
                  setTaxSettings({
                    ...taxSettings,
                    serviceFee: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Printer Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Printer Configuration</CardTitle>
          <CardDescription>Configure printers for different outputs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="kitchen-printer">Kitchen Printer</Label>
              <select
                id="kitchen-printer"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={printerSettings.kitchenPrinter}
                onChange={(e) =>
                  setPrinterSettings({
                    ...printerSettings,
                    kitchenPrinter: e.target.value,
                  })
                }
              >
                <option>Printer-1</option>
                <option>Printer-2</option>
                <option>None</option>
              </select>
            </div>

            <div>
              <Label htmlFor="receipt-printer">Receipt Printer</Label>
              <select
                id="receipt-printer"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={printerSettings.receiptPrinter}
                onChange={(e) =>
                  setPrinterSettings({
                    ...printerSettings,
                    receiptPrinter: e.target.value,
                  })
                }
              >
                <option>Printer-1</option>
                <option>Printer-2</option>
                <option>None</option>
              </select>
            </div>

            <div>
              <Label htmlFor="table-printer">Table Printer</Label>
              <select
                id="table-printer"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={printerSettings.tablePrinter}
                onChange={(e) =>
                  setPrinterSettings({
                    ...printerSettings,
                    tablePrinter: e.target.value,
                  })
                }
              >
                <option>None</option>
                <option>Printer-1</option>
                <option>Printer-2</option>
              </select>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Printer className="w-4 h-4 mr-2" />
            Test Printers
          </Button>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage staff accounts and roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                    {user.role}
                  </span>
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            Add New User
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
        <Button variant="outline" size="lg" className="flex-1">
          Reset
        </Button>
      </div>
    </div>
  );
}
