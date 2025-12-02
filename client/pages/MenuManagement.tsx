import { useState } from 'react';
import { apiService, type MenuItem, type Category } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MenuGridSkeleton } from '@/components/LoadingSkeleton';

export default function MenuManagement() {
  const queryClient = useQueryClient();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: 0,
    price: 0,
    description: '',
  });

  // Use React Query for caching
  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => apiService.getMenuItems(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const loading = loadingItems || loadingCategories;

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.category_id || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await apiService.createMenuItem({
        name: formData.name,
        category_id: formData.category_id,
        price: formData.price,
        description: formData.description || undefined,
        is_available: true,
      });
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setFormData({ name: '', category_id: 0, price: 0, description: '' });
      setIsAddingNew(false);
    } catch (error) {
      console.error('Failed to create menu item:', error);
      alert('Failed to create menu item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id.toString());
    setFormData({
      name: item.name,
      category_id: item.category_id,
      price: item.price,
      description: item.description || '',
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      await apiService.updateMenuItem(parseInt(editingId), {
        name: formData.name,
        category_id: formData.category_id,
        price: formData.price,
        description: formData.description || undefined,
      });
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setEditingId(null);
      setFormData({ name: '', category_id: 0, price: 0, description: '' });
    } catch (error) {
      console.error('Failed to update menu item:', error);
      alert('Failed to update menu item');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await apiService.deleteMenuItem(id);
        // Invalidate cache to refetch
        queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      } catch (error) {
        console.error('Failed to delete menu item:', error);
        alert('Failed to delete menu item');
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Add, edit, and manage menu items</p>
        </div>
        <Button onClick={() => setIsAddingNew(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <span
            key={category.id}
            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
          >
            {category.name}
          </span>
        ))}
      </div>

      {loading ? (
        <MenuGridSkeleton />
      ) : (
        <>
          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className={editingId === item.id.toString() ? 'ring-2 ring-primary' : ''}
              >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{item.image || '🍽️'}</span>
                    <h3 className="font-bold text-lg">{item.name || 'Unnamed Item'}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted w-fit px-2 py-1 rounded">
                    {item.category_name || categories.find(c => c.id === item.category_id)?.name || 'Unknown'}
                  </p>
                </div>
              </div>

              {editingId === item.id.toString() ? (
                <div className="space-y-3 border-t pt-3">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Price</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={handleUpdate}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <p className="font-bold text-lg text-primary">
                      ₹{typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
            ))}
          </div>
        </>
      )}

      {/* Add New Item Form */}
      {isAddingNew && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsAddingNew(false)}
        >
          <Card
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Menu Item</CardTitle>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Espresso"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: parseInt(e.target.value) })
                  }
                >
                  <option value={0}>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Optional description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleAdd}>
                  Add Item
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddingNew(false)}
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
