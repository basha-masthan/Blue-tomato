import { useEffect, useState, useCallback } from 'react';
import {
  Search, Plus, Edit2, Trash2, Loader2, AlertTriangle,
  Home, UtensilsCrossed, Car, ChevronRight,
  Power, CheckCircle2, Image as ImageIcon, Layers, List,
} from 'lucide-react';
import apiClient from '../api/client';

const SERVICE_TYPES = [
  { key: 'home_services', label: 'Home Services', icon: Home, color: 'indigo' },
  { key: 'food', label: 'Food & Dining', icon: UtensilsCrossed, color: 'orange' },
  { key: 'rides', label: 'Rides', icon: Car, color: 'blue' },
];

const colorMap = {
  indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  blue: { bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const EMPTY_FORM = { name: '', image: '', description: '', isActive: true };
const EMPTY_SUB = { name: '', category: '', basePrice: '', description: '', isActive: true };

export default function Services() {
  const [activeType, setActiveType] = useState('home_services');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [modal, setModal] = useState(null); // null | 'add_cat' | 'edit_cat' | 'add_sub' | 'edit_sub' | 'del_cat' | 'del_sub'
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [catForm, setCatForm] = useState(EMPTY_FORM);
  const [subForm, setSubForm] = useState(EMPTY_SUB);

  // Only fetch for home_services
  const isHomeServices = activeType === 'home_services';

  const fetchCategories = useCallback(async () => {
    if (!isHomeServices) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/categories', { params: { search } });
      setCategories(res.data.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isHomeServices, search]);

  const fetchSubcategories = useCallback(async () => {
    if (!isHomeServices) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/subcategories');
      setSubcategories(res.data.subcategories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isHomeServices]);

  useEffect(() => {
    if (!selectedCategory) fetchCategories();
    else fetchSubcategories();
  }, [selectedCategory, activeType, fetchCategories, fetchSubcategories]);

  // ── Category CRUD ────────────────────────────────────────────
  const openAddCat = () => { setCatForm(EMPTY_FORM); setModal('add_cat'); };
  const openEditCat = (cat) => { setEditingItem(cat); setCatForm({ name: cat.name, image: cat.image || '', description: cat.description || '', isActive: cat.isActive }); setModal('edit_cat'); };
  const openDelCat = (id) => { setDeleteId(id); setModal('del_cat'); };

  const saveCat = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (modal === 'edit_cat') await apiClient.patch(`/categories/${editingItem._id}`, catForm);
      else await apiClient.post('/categories', catForm);
      setModal(null);
      fetchCategories();
    } catch (err) { alert(err.response?.data?.message || 'Failed to save'); }
    finally { setActionLoading(false); }
  };

  const deleteCat = async () => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/categories/${deleteId}`);
      setModal(null);
      fetchCategories();
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
    finally { setActionLoading(false); }
  };

  const toggleCat = async (id, current) => {
    try {
      await apiClient.patch(`/categories/${id}`, { isActive: !current });
      fetchCategories();
    } catch (e) { alert('Failed to toggle'); }
  };

  // ── Subcategory CRUD ─────────────────────────────────────────
  const openAddSub = () => { 
    setSubForm({ ...EMPTY_SUB, category: selectedCategory ? selectedCategory._id : '' }); 
    setModal('add_sub'); 
  };
  const openEditSub = (sub) => {
    setEditingItem(sub);
    setSubForm({ name: sub.name, category: sub.category?._id || sub.category || '', basePrice: sub.basePrice || '', description: sub.description || '', isActive: sub.isActive });
    setModal('edit_sub');
  };
  const openDelSub = (id) => { setDeleteId(id); setModal('del_sub'); };

  const saveSub = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { ...subForm, basePrice: Number(subForm.basePrice) || 0 };
      if (modal === 'edit_sub') await apiClient.patch(`/subcategories/${editingItem._id}`, payload);
      else await apiClient.post('/subcategories', payload);
      setModal(null);
      fetchSubcategories();
    } catch (err) { alert(err.response?.data?.message || 'Failed to save'); }
    finally { setActionLoading(false); }
  };

  const deleteSub = async () => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/subcategories/${deleteId}`);
      setModal(null);
      fetchSubcategories();
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
    finally { setActionLoading(false); }
  };

  const toggleSub = async (id, current) => {
    try {
      await apiClient.patch(`/subcategories/${id}`, { isActive: !current });
      fetchSubcategories();
    } catch (e) { alert('Failed to toggle'); }
  };

  const activeTypeConfig = SERVICE_TYPES.find(t => t.key === activeType);
  const colors = colorMap[activeTypeConfig?.color || 'indigo'];

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage categories and sub-services by type</p>
        </div>
      </div>

      {/* ── Service Type Tabs ──────────────────────────────────── */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {SERVICE_TYPES.map(({ key, label, icon: Icon, color }) => {
          const isActive = activeType === key;
          const c = colorMap[color];
          return (
            <button
              key={key}
              onClick={() => { setActiveType(key); setSelectedCategory(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-semibold border-b-2 transition-all ${
                isActive
                  ? `border-${color === 'indigo' ? 'indigo' : color}-600 text-${color === 'indigo' ? 'indigo' : color}-700 bg-white`
                  : 'border-transparent text-gray-500 hover:text-gray-700 bg-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {key === 'food' || key === 'rides' ? (
                <span className="text-xs text-gray-400 font-normal">(Soon)</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {activeType !== 'home_services' ? (
        /* ── Placeholder for Food / Rides ────────────────────── */
        <div className="card py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeType === 'food' ? <UtensilsCrossed className="w-8 h-8 text-gray-300" /> : <Car className="w-8 h-8 text-gray-300" />}
          </div>
          <p className="text-lg font-semibold text-gray-400">Coming Soon</p>
          <p className="text-sm text-gray-400 mt-1">
            {activeType === 'food' ? 'Food delivery management' : 'Ride management'} will be available in a future update.
          </p>
        </div>
      ) : (
        <>
          {/* ── Breadcrumbs / Header ─────────── */}
          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm font-medium">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`${!selectedCategory ? 'text-indigo-700 font-bold' : 'text-gray-500 hover:text-gray-700'} transition-colors flex items-center gap-1`}
              >
                <Layers className="w-4 h-4" />
                Categories
              </button>
              {selectedCategory && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  <span className="text-indigo-700 font-bold flex items-center gap-1">
                    <List className="w-4 h-4" />
                    {selectedCategory.name} Sub-Services
                  </span>
                </>
              )}
            </div>

            <div className="flex-1" />

            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${!selectedCategory ? 'Categories' : 'Sub-Services'}…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={!selectedCategory ? openAddCat : openAddSub}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {!selectedCategory ? 'Category' : 'Sub-Service'}
            </button>
          </div>

          {/* ── Table ───────────────────────────────────────────── */}
          <div className="card overflow-x-auto mt-4">
            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : !selectedCategory ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Icon/Image', 'Name', 'Description', 'Status', 'Actions'].map(h => (
                      <th key={h} className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4 ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.length === 0 ? (
                    <tr><td colSpan={5} className="py-16 text-center text-gray-400">
                      No categories yet. Add your first one!
                    </td></tr>
                  ) : categories.filter(c =>
                    !search || c.name?.toLowerCase().includes(search.toLowerCase())
                  ).map(cat => (
                    <tr key={cat._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedCategory(cat)}>
                      <td className="py-4 px-4">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded-xl" />
                        ) : (
                          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Home className="w-5 h-5 text-indigo-300" />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-500 max-w-xs truncate">{cat.description || '—'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleCat(cat._id, cat.isActive)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                            cat.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          <Power className={`w-3.5 h-3.5`} />
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); openEditCat(cat); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); openDelCat(cat._id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Sub-Service Name', 'Base Price', 'Status', 'Actions'].map(h => (
                      <th key={h} className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4 ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {subcategories.filter(s => s.category?._id === selectedCategory._id || s.category === selectedCategory._id).length === 0 ? (
                    <tr><td colSpan={4} className="py-16 text-center text-gray-400">
                      No sub-services found for this category.
                    </td></tr>
                  ) : subcategories.filter(s =>
                    (s.category?._id === selectedCategory._id || s.category === selectedCategory._id) && 
                    (!search || s.name?.toLowerCase().includes(search.toLowerCase()))
                  ).map(sub => (
                    <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="text-sm font-semibold text-gray-900">{sub.name}</p>
                        {sub.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{sub.description}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-gray-700">
                          {sub.basePrice ? `₹${sub.basePrice}` : '—'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleSub(sub._id, sub.isActive)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                            sub.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          <Power className={`w-3.5 h-3.5`} />
                          {sub.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditSub(sub)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => openDelSub(sub._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── Modal: Add / Edit Category ────────────────────────── */}
      {(modal === 'add_cat' || modal === 'edit_cat') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              {modal === 'edit_cat' ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={saveCat} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input required value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} className="input" placeholder="e.g. Plumbing" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="url" value={catForm.image} onChange={e => setCatForm({ ...catForm, image: e.target.value })} className="input" placeholder="https://..." />
                {catForm.image && <img src={catForm.image} alt="preview" className="w-16 h-16 object-cover rounded-xl mt-2" onError={e => e.target.style.display='none'} />}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} className="input min-h-[80px]" placeholder="Brief description…" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={catForm.isActive} onChange={e => setCatForm({ ...catForm, isActive: e.target.checked })} className="rounded border-gray-300 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Active (visible to users)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Add / Edit Subcategory ─────────────────────── */}
      {(modal === 'add_sub' || modal === 'edit_sub') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              {modal === 'edit_sub' ? 'Edit Sub-Service' : 'Add New Sub-Service'}
            </h3>
            <form onSubmit={saveSub} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Service Name *</label>
                <input required value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })} className="input" placeholder="e.g. Bathroom Repair" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category *</label>
                <select required value={subForm.category} onChange={e => setSubForm({ ...subForm, category: e.target.value })} className="input" disabled={!!selectedCategory}>
                  <option value="">Select a category…</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {categories.length === 0 && <p className="text-xs text-orange-600 mt-1">⚠ Add categories first</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                <input type="number" min="0" value={subForm.basePrice} onChange={e => setSubForm({ ...subForm, basePrice: e.target.value })} className="input" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={subForm.description} onChange={e => setSubForm({ ...subForm, description: e.target.value })} className="input min-h-[70px]" placeholder="Brief description…" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={subForm.isActive} onChange={e => setSubForm({ ...subForm, isActive: e.target.checked })} className="rounded border-gray-300 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmations ───────────────────────────────── */}
      {(modal === 'del_cat' || modal === 'del_sub') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete {modal === 'del_cat' ? 'Category' : 'Sub-Service'}?</h3>
                <p className="text-xs text-gray-500">This cannot be undone</p>
              </div>
            </div>
            {modal === 'del_cat' && (
              <p className="text-sm text-gray-600 mb-5">This will also delete all sub-services under this category.</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 btn-secondary">Cancel</button>
              <button
                onClick={modal === 'del_cat' ? deleteCat : deleteSub}
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
