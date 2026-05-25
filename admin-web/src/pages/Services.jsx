import { useEffect, useState } from 'react';
import {
  Search,
  Power,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  UtensilsCrossed,
  AlertTriangle,
} from 'lucide-react';
import apiClient from '../api/client';

export default function Services() {
  const [activeTab, setActiveTab] = useState('services');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        activeTab === 'services' ? '/services' : '/menu-items',
        { params: { search } }
      );
      setItems(activeTab === 'services' ? response.data.services : response.data.items);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleToggle = async (id) => {
    setActionLoading(id);
    try {
      await apiClient.patch(`/services/${id}/toggle`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle');
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteItemId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setActionLoading(`delete-${deleteItemId}`);
    try {
      await apiClient.delete(`/services/${deleteItemId}`);
      setShowDeleteModal(false);
      setDeleteItemId(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (page) => {
    // Page change logic would go here with search params
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'services'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Services
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'menu'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          Food Items
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'services' ? 'services' : 'food items'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">{activeTab === 'services' ? 'Category' : 'Restaurant'}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Price</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  No {activeTab === 'services' ? 'services' : 'food items'} found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.type || item.category}</p>
                  </td>
                  <td className="py-4 px-4">
                    {activeTab === 'services' ? (
                      <span className="text-sm text-gray-600">{item.category}</span>
                    ) : (
                      <span className="text-sm text-gray-600">{item.restaurantId?.name || 'N/A'}</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">
                      ₹{item.price || item.priceFrom || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`badge ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggle(item._id)}
                        disabled={actionLoading === item._id}
                        className={`p-2 rounded-lg transition-colors ${
                          item.isAvailable
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={item.isAvailable ? 'Disable' : 'Enable'}
                      >
                        {actionLoading === item._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openDeleteModal(item._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Item</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this {activeTab === 'services' ? 'service' : 'menu item'}?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading === `delete-${deleteItemId}`}
                className="flex-1 btn-danger flex items-center justify-center gap-2"
              >
                {actionLoading === `delete-${deleteItemId}` ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
