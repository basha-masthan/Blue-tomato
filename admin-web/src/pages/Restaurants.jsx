import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Power,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  UtensilsCrossed,
} from 'lucide-react';
import apiClient from '../api/client';

export default function Restaurants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, [searchParams]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const page = searchParams.get('page') || 1;
      const status = searchParams.get('status') || '';
      const searchQuery = searchParams.get('search') || '';

      const response = await apiClient.get('/restaurants', {
        params: { page, status, search: searchQuery },
      });
      setRestaurants(response.data.restaurants);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
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

  const handleToggle = async (id, field) => {
    setActionLoading(`${field}-${id}`);
    try {
      const restaurant = restaurants.find((r) => r._id === id);
      const updateData = {};
      updateData[field] = !restaurant[field];
      await apiClient.patch(`/restaurants/${id}`, updateData);
      fetchRestaurants();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update');
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
              placeholder="Search restaurants..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No restaurants found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div key={restaurant._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {restaurant.isFeatured && (
                    <span className="badge bg-yellow-100 text-yellow-800">Featured</span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{restaurant.description || 'No description'}</p>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{restaurant.deliveryRating || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{restaurant.deliveryTimeText || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{restaurant.location?.city || 'N/A'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {restaurant.cuisines?.slice(0, 3).map((cuisine) => (
                  <span key={cuisine} className="badge bg-gray-100 text-gray-600">
                    {cuisine}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleToggle(restaurant._id, 'isActive')}
                  disabled={actionLoading === `isActive-${restaurant._id}`}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    restaurant.isActive
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {actionLoading === `isActive-${restaurant._id}` ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    restaurant.isActive ? 'Deactivate' : 'Activate'
                  )}
                </button>
                <button
                  onClick={() => handleToggle(restaurant._id, 'isFeatured')}
                  disabled={actionLoading === `isFeatured-${restaurant._id}`}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    restaurant.isFeatured
                      ? 'text-yellow-600 hover:bg-yellow-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {actionLoading === `isFeatured-${restaurant._id}` ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    restaurant.isFeatured ? 'Unfeature' : 'Feature'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between card">
          <p className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} restaurants
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
    </div>
  );
}
