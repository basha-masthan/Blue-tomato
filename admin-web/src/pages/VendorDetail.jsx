import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Power,
  Loader2,
  Store,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import apiClient from '../api/client';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/vendors/${id}`);
      setVendor(response.data.vendor);
    } catch (error) {
      console.error('Failed to fetch vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      await apiClient.patch(`/vendors/${id}/approve`);
      fetchVendor();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setActionLoading('reject');
    try {
      await apiClient.patch(`/vendors/${id}/reject`, { reason: rejectReason });
      setShowRejectModal(false);
      setRejectReason('');
      fetchVendor();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async () => {
    setActionLoading('toggle');
    try {
      await apiClient.patch(`/vendors/${id}/toggle`);
      fetchVendor();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vendor not found</p>
        <button onClick={() => navigate('/vendors')} className="btn-primary mt-4">
          Back to Vendors
        </button>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/vendors')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Vendors</span>
      </button>

      {/* Vendor Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary-700">
                {vendor.name?.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{vendor.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${statusColors[vendor.approvalStatus]}`}>
                  {vendor.approvalStatus}
                </span>
                <span className={`badge ${vendor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {vendor.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {vendor.approvalStatus === 'pending' && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading === 'approve'}
                  className="btn-success flex items-center gap-2"
                >
                  {actionLoading === 'approve' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="btn-danger flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {vendor.approvalStatus === 'approved' && (
              <button
                onClick={handleToggle}
                disabled={actionLoading === 'toggle'}
                className={`flex items-center gap-2 ${vendor.isActive ? 'btn-danger' : 'btn-success'}`}
              >
                {actionLoading === 'toggle' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Power className="w-4 h-4" />
                )}
                {vendor.isActive ? 'Deactivate' : 'Activate'}
              </button>
            )}
          </div>
        </div>

        {vendor.approvalStatus === 'rejected' && vendor.rejectionReason && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Rejection Reason</p>
                <p className="text-sm text-red-700 mt-1">{vendor.rejectionReason}</p>
                <p className="text-xs text-red-500 mt-1">
                  Rejected on {new Date(vendor.rejectedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{vendor.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{vendor.phone}</span>
            </div>
            {vendor.dateOfBirth && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date(vendor.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 capitalize">{vendor.registrationType}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Address</h3>
          {vendor.currentAddress ? (
            <div className="space-y-1">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    {vendor.currentAddress.apartment && `${vendor.currentAddress.apartment}, `}
                    {vendor.currentAddress.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {vendor.currentAddress.city}, {vendor.currentAddress.state}
                  </p>
                  <p className="text-sm text-gray-600">
                    {vendor.currentAddress.country} - {vendor.currentAddress.zip}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No address provided</p>
          )}
        </div>

        {/* Bank Details */}
        {vendor.bankDetails && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Bank:</span> <span className="text-gray-900">{vendor.bankDetails.bankName}</span></p>
              <p><span className="text-gray-500">Account Holder:</span> <span className="text-gray-900">{vendor.bankDetails.accountHolderName}</span></p>
              <p><span className="text-gray-500">Account Number:</span> <span className="text-gray-900">{vendor.bankDetails.accountNumber}</span></p>
              <p><span className="text-gray-500">IFSC:</span> <span className="text-gray-900">{vendor.bankDetails.ifscCode}</span></p>
            </div>
          </div>
        )}

        {/* KYC Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Information</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">KYC Complete:</span>{' '}
              <span className={vendor.kycComplete ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                {vendor.kycComplete ? 'Yes' : 'No'}
              </span>
            </p>
            <p>
              <span className="text-gray-500">Verified:</span>{' '}
              <span className={vendor.isVerified ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                {vendor.isVerified ? 'Yes' : 'No'}
              </span>
            </p>
            {vendor.aadhaar?.number && (
              <p><span className="text-gray-500">Aadhaar:</span> <span className="text-gray-900">{vendor.aadhaar.number}</span></p>
            )}
            {vendor.pan?.number && (
              <p><span className="text-gray-500">PAN:</span> <span className="text-gray-900">{vendor.pan.number}</span></p>
            )}
          </div>
        </div>
      </div>

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
                disabled={actionLoading === 'reject'}
                className="flex-1 btn-danger flex items-center justify-center gap-2"
              >
                {actionLoading === 'reject' ? (
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
