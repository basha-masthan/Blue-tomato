import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Power,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import apiClient from '../api/client';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function Vendors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vendors, setVendors] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectVendorId, setRejectVendorId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchVendors();
  }, [searchParams]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const page = searchParams.get('page') || 1;
      const status = searchParams.get('status') || '';
      const searchQuery = searchParams.get('search') || '';

      const response = await apiClient.get('/vendors', {
        params: { page, status, search: searchQuery },
      });
      setVendors(response.data.vendors);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleStatusFilter = (status) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    setSearchParams(params);
    setStatusFilter(status);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await apiClient.patch(`/vendors/${id}/approve`);
      fetchVendors();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve vendor');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectVendorId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setActionLoading(rejectVendorId);
    try {
      await apiClient.patch(`/vendors/${rejectVendorId}/reject`, { reason: rejectReason });
      setShowRejectModal(false);
      setRejectVendorId(null);
      setRejectReason('');
      fetchVendors();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject vendor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (id) => {
    setActionLoading(`toggle-${id}`);
    try {
      await apiClient.patch(`/vendors/${id}/toggle`);
      fetchVendors();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle vendor');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </form>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="input w-40"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Vendor</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Type</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Active</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Registered</th>
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
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  No vendors found
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary-700">
                          {vendor.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                        <p className="text-xs text-gray-500">{vendor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600 capitalize">{vendor.registrationType}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`badge ${statusColors[vendor.approvalStatus] || 'bg-gray-100 text-gray-800'}`}>
                      {vendor.approvalStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`badge ${vendor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/vendors/${vendor._id}`}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {vendor.approvalStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(vendor._id)}
                            disabled={actionLoading === vendor._id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            {actionLoading === vendor._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openRejectModal(vendor._id)}
                            disabled={actionLoading === vendor._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {vendor.approvalStatus === 'approved' && (
                        <button
                          onClick={() => handleToggle(vendor._id)}
                          disabled={actionLoading === `toggle-${vendor._id}`}
                          className={`p-2 rounded-lg transition-colors ${
                            vendor.isActive
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={vendor.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {actionLoading === `toggle-${vendor._id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between card">
          <p className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} vendors
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reject Vendor</h3>
                <p className="text-sm text-gray-500">Please provide a reason for rejection</p>
              </div>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="input resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectVendorId}
                className="flex-1 btn-danger flex items-center justify-center gap-2"
              >
                {actionLoading === rejectVendorId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Reject Vendor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
