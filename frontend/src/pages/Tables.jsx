import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { tableAPI } from '../services/apiEndpoints';
import { Plus, Edit2, Trash2, X, AlertCircle, Loader, QrCode } from 'lucide-react';

const TABLE_STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  reserved: 'bg-blue-100 text-blue-800',
};

export default function Tables() {
  const { data: tablesData = {}, loading, execute: refetch } = useApi(() =>
    tableAPI.getTables({})
  );

  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    tableNumber: '',
    seatCapacity: '',
    status: 'available',
    location: '',
  });

  const tables = tablesData?.tables || [];

  const handleAddTable = () => {
    setError(null);
    setEditingTable(null);
    setFormData({
      tableNumber: '',
      seatCapacity: '',
      status: 'available',
      location: '',
    });
    setShowForm(true);
  };

  const handleEditTable = (table) => {
    setError(null);
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      seatCapacity: table.seatCapacity,
      status: table.status || 'available',
      location: table.location || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const submitData = {
        tableNumber: Number(formData.tableNumber),
        seatCapacity: Number(formData.seatCapacity),
        location: formData.location,
      };

      console.log('📝 Submitting table data:', submitData);

      if (editingTable) {
        console.log(`🔄 Updating table ${editingTable.id}...`);
        await tableAPI.updateTable(editingTable.id, submitData);
        setSuccess('Table updated successfully');
      } else {
        console.log('✏️ Creating new table...');
        const response = await tableAPI.createTable(submitData);
        console.log('✅ Table created successfully:', response);
        setSuccess('Table created successfully');
      }

      setShowForm(false);
      console.log('🔄 Refetching tables list...');
      const updatedData = await refetch(); // Wait for data to reload
      console.log('📊 Tables list updated:', updatedData);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error during table operation:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save table';
      console.error('Error details:', errorMessage);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (confirm('Are you sure you want to delete this table?')) {
      try {
        console.log(`🗑️ Deleting table ${tableId}...`);
        await tableAPI.deleteTable(tableId);
        setSuccess('Table deleted successfully');
        console.log('🔄 Refetching tables list after delete...');
        await refetch(); // Wait for data to reload
        console.log('✅ Tables list refreshed after deletion');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('❌ Error deleting table:', err);
        setError(err.response?.data?.message || 'Failed to delete table');
      }
    }
  };

  const handleStatusUpdate = async (tableId, newStatus) => {
    try {
      console.log(`🔄 Updating table ${tableId} status to ${newStatus}...`);
      await tableAPI.updateTable(tableId, { status: newStatus });
      setSuccess(`Table status updated to ${newStatus}`);
      console.log('🔄 Refetching tables list after status update...');
      await refetch(); // Wait for data to reload
      console.log('✅ Tables list refreshed after status update');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error updating table status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const availableCount = tables.filter(t => t.status === 'available').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
        <button
          onClick={handleAddTable}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Table
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-gray-600 text-sm font-medium">Available</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{availableCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm font-medium">Occupied</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{occupiedCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm font-medium">Reserved</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{reservedCount}</p>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.length > 0 ? (
          tables.map((table) => (
            <div key={table.id} className={`card p-6 border-l-4 ${
              table.status === 'available' ? 'border-green-500' :
              table.status === 'occupied' ? 'border-red-500' :
              'border-blue-500'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Table {table.tableNumber}</h3>
                  <p className="text-sm text-gray-600">Capacity: {table.seatCapacity} persons</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${TABLE_STATUS_COLORS[table.status]}`}>
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </span>
              </div>

              {table.location && (
                <p className="text-sm text-gray-600 mb-4">📍 {table.location}</p>
              )}

              <div className="flex gap-2 mb-4">
                <select
                  value={table.status}
                  onChange={(e) => handleStatusUpdate(table.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEditTable(table)}
                  className="flex-1 p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="flex-1 p-2 hover:bg-red-100 rounded-lg text-red-600 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card text-center py-12">
            <p className="text-gray-600 mb-4">No tables yet</p>
            <button
              onClick={handleAddTable}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create First Table
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setError(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number *</label>
                <input
                  type="number"
                  placeholder="e.g., 1, 2, 3..."
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  className="input w-full"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seat Capacity *</label>
                <input
                  type="number"
                  placeholder="e.g., 2, 4, 6..."
                  value={formData.seatCapacity}
                  onChange={(e) => setFormData({ ...formData, seatCapacity: e.target.value })}
                  className="input w-full"
                  min="1"
                  max="20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g., Window seat, Corner"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input w-full"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                >
                  {submitting ? 'Saving...' : editingTable ? 'Update' : 'Create'} Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
