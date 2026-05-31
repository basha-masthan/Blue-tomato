import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';
import apiClient from '../api/client';

export default function Subcategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [deleteSubcategoryId, setDeleteSubcategoryId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    basePrice: 0,
    description: '',
    image: '',
    isActive: true,
  });

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, [search]); // Simplified

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/subcategories', { params: { search } });
      setSubcategories(response.data.subcategories || response.data);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data.categories || response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubcategories();
  };

  const openFormModal = (subcategory = null) => {
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setFormData({
        name: subcategory.name,
        category: subcategory.category?._id || subcategory.category || '',
        basePrice: subcategory.basePrice || 0,
        description: subcategory.description || '',
        image: subcategory.image || '',
        isActive: subcategory.isActive,
      });
    } else {
      setEditingSubcategory(null);
      setFormData({
        name: '',
        category: categories.length > 0 ? categories[0]._id : '',
        basePrice: 0,
        description: '',
        image: '',
        isActive: true,
      });
    }
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingSubcategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingSubcategory) {
        await apiClient.patch(`/subcategories/${editingSubcategory._id}`, formData);
      } else {
        await apiClient.post('/subcategories', formData);
      }
      closeFormModal();
      fetchSubcategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save subcategory');
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteSubcategoryId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/subcategories/${deleteSubcategoryId}`);
      setShowDeleteModal(false);
      setDeleteSubcategoryId(null);
      fetchSubcategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete subcategory');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Subcategories</h1>
        <button onClick={() => openFormModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Subcategory
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subcategories..."
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
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Category</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Base Price</th>
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
            ) : (!subcategories || subcategories.length === 0) ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  No subcategories found
                </td>
              </tr>
            ) : (
              subcategories.map((subcategory) => (
                <tr key={subcategory._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    {subcategory.image ? (
                      <img src={subcategory.image} alt={subcategory.name} className="w-12 h-12 object-cover rounded-lg" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-gray-900">{subcategory.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{subcategory.description || '-'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{subcategory.category?.name || 'N/A'}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-gray-900">₹{subcategory.basePrice || 0}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`badge ${subcategory.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {subcategory.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openFormModal(subcategory)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(subcategory._id)}
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
              {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="input"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[80px]"
                />
              </div>
              <div className="flex items-center gap-2">
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
                <h3 className="text-lg font-semibold text-gray-900">Delete Subcategory</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this subcategory?
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
