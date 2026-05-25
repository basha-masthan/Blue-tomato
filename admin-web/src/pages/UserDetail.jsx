import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Power,
  Loader2,
} from 'lucide-react';
import apiClient from '../api/client';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/users/${id}`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/users/${id}/toggle`);
      fetchUser();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle user');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
        <button onClick={() => navigate('/users')} className="btn-primary mt-4">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/users')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Users</span>
      </button>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary-700">
                {user.name?.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="badge bg-gray-100 text-gray-600 capitalize">{user.loginMethod}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={actionLoading}
            className={`flex items-center gap-2 ${user.isActive ? 'btn-danger' : 'btn-success'}`}
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            {user.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{user.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{user.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Verified:</span> <span className="text-gray-900">{user.isVerified ? 'Yes' : 'No'}</span></p>
            <p><span className="text-gray-500">Role:</span> <span className="text-gray-900 capitalize">{user.role}</span></p>
            <p><span className="text-gray-500">Addresses:</span> <span className="text-gray-900">{user.addresses?.length || 0}</span></p>
          </div>
        </div>

        {user.addresses && user.addresses.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Addresses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div key={addr._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{addr.label}</p>
                      <p className="text-sm text-gray-600">{addr.addressLine1}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                      {addr.isDefault && (
                        <span className="badge bg-primary-100 text-primary-700 mt-2">Default</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
