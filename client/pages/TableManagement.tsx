import { useEffect, useState } from 'react';
import { apiService, mockTables } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const statusColors = {
  free: 'bg-green-100 text-green-800',
  running: 'bg-blue-100 text-blue-800',
  reserved: 'bg-yellow-100 text-yellow-800',
};

const statusIcons = {
  free: '✅',
  running: '⏳',
  reserved: '📅',
};

export default function TableManagement() {
  const [tables, setTables] = useState(mockTables);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<any>(null);

  useEffect(() => {
    const fetchTables = async () => {
      const data = await apiService.getTables();
      setTables(data);
      setLoading(false);
    };
    fetchTables();
  }, []);

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    const newTables = tables.map((t: any) =>
      t.id === tableId ? { ...t, status: newStatus } : t
    );
    setTables(newTables);
    setSelectedTable(null);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  const stats = {
    free: tables.filter((t: any) => t.status === 'free').length,
    running: tables.filter((t: any) => t.status === 'running').length,
    reserved: tables.filter((t: any) => t.status === 'reserved').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Table Management</h1>
        <p className="text-muted-foreground">Manage restaurant seating and table status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.free}</div>
            <p className="text-xs text-muted-foreground mt-1">Tables ready</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently serving</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
            <p className="text-xs text-muted-foreground mt-1">Bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Tables</CardTitle>
          <CardDescription>Click on a table to change its status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.map((table: any) => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={cn(
                  'aspect-square rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all hover:shadow-lg',
                  statusColors[table.status as keyof typeof statusColors]
                )}
              >
                <span className="text-3xl">{statusIcons[table.status as keyof typeof statusIcons]}</span>
                <span className="font-bold">T-{table.number}</span>
                <span className="text-xs">Cap: {table.capacity}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table Details Modal */}
      {selectedTable && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTable(null)}
        >
          <Card
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>Table {selectedTable.number}</CardTitle>
              <CardDescription>
                Capacity: {selectedTable.capacity} | Current Status: {selectedTable.status.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTable.occupiedBy && (
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm font-medium">Current Order: {selectedTable.occupiedBy}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Change Status:</p>
                <div className="grid grid-cols-3 gap-2">
                  {['free', 'running', 'reserved'].map((status) => (
                    <Button
                      key={status}
                      variant={selectedTable.status === status ? 'default' : 'outline'}
                      className="capitalize"
                      onClick={() => handleStatusChange(selectedTable.id, status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedTable(null)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
