import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  Power,
} from 'lucide-react';
import apiClient from '../api/client';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteBannerId, setDeleteBannerId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    actionType: 'none',
    actionValue: '',
    targetApp: 'user',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
  }, [search]); // Adjust if targetApp filter is added later

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/banners', { params: { search } });
      setBanners(response.data.banners || response.data);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBanners();
  };

  const openFormModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        image: banner.image || '',
        actionType: banner.actionType || 'none',
        actionValue: banner.actionValue || '',
        targetApp: banner.targetApp || 'user',
        sortOrder: banner.sortOrder || 0,
        isActive: banner.isActive,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        actionType: 'none',
        actionValue: '',
        targetApp: 'user',
        sortOrder: 0,
        isActive: true,
      });
    }
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingBanner(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingBanner) {
        await apiClient.patch(`/banners/${editingBanner._id}`, formData);
      } else {
        await apiClient.post('/banners', formData);
      }
      closeFormModal();
      fetchBanners();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save banner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (id) => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/banners/${id}/toggle`);
      fetchBanners();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle banner');
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteBannerId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/banners/${deleteBannerId}`);
      setShowDeleteModal(false);
      setDeleteBannerId(null);
      fetchBanners();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete banner');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
        <button onClick={() => openFormModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search banners..."
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
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Image</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Details</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Action</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Target App</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                </td>
              </tr>
            ) : (!banners || banners.length === 0) ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  No banners found
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    {banner.image ? (
                      <img src={banner.image} alt={banner.title} className="w-20 h-10 object-cover rounded-lg" />
                    ) : (
                      <div className="w-20 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-gray-900">{banner.title}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{banner.subtitle || '-'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600 capitalize">{banner.actionType}</span>
                    {banner.actionType !== 'none' && banner.actionValue && (
                      <p className="text-xs text-gray-400 truncate max-w-[120px]">{banner.actionValue}</p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600 capitalize">{banner.targetApp}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`badge ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggle(banner._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          banner.isActive
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={banner.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openFormModal(banner)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(banner._id)}
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

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingBanner ? 'Edit Banner' : 'Add Banner'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="input"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                  <select
                    value={formData.actionType}
                    onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                    className="input"
                  >
                    <option value="none">None</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="category">Category</option>
                    <option value="url">URL</option>
                    <option value="screen">Screen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Value</label>
                  <input
                    type="text"
                    value={formData.actionValue}
                    onChange={(e) => setFormData({ ...formData, actionValue: e.target.value })}
                    className="input"
                    disabled={formData.actionType === 'none'}
                    placeholder={formData.actionType !== 'none' ? 'ID or URL' : ''}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target App</label>
                  <select
                    value={formData.targetApp}
                    onChange={(e) => setFormData({ ...formData, targetApp: e.target.value })}
                    className="input"
                  >
                    <option value="user">User</option>
                    <option value="vendor">Vendor</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Banner</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this banner?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 btn-danger flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
