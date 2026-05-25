import { useEffect, useState } from 'react';
import {
  Users,
  Store,
  ClipboardList,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import apiClient from '../api/client';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function StatCard({ title, value, icon: Icon, trend, trendValue, color }) {
  const colorClasses = {
    blue: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color] || colorClasses.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentVendors, setRecentVendors] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentVendors();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentVendors = async () => {
    try {
      const response = await apiClient.get('/vendors?status=pending&limit=5');
      setRecentVendors(response.data.vendors);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const revenueData = stats?.revenueByMonth?.map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    revenue: item.total,
  })) || [];

  const orderStatusData = stats?.orderStatusCounts?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.stats?.totalUsers || 0}
          icon={Users}
          trend="up"
          trendValue={`+${stats?.stats?.weeklyNewUsers || 0} this week`}
          color="blue"
        />
        <StatCard
          title="Total Vendors"
          value={stats?.stats?.totalVendors || 0}
          icon={Store}
          trend="up"
          trendValue={`+${stats?.stats?.weeklyNewVendors || 0} this week`}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={stats?.stats?.totalOrders || 0}
          icon={ClipboardList}
          trend="up"
          trendValue={`${stats?.stats?.monthlyOrders || 0} this month`}
          color="orange"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.stats?.monthlyRevenue)}
          icon={CreditCard}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Month</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {orderStatusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600 capitalize">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Pending Vendors</p>
                  <p className="text-xs text-gray-500">Awaiting approval</p>
                </div>
              </div>
              <span className="text-lg font-bold text-yellow-600">{stats?.stats?.pendingVendors || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Active Vendors</p>
                  <p className="text-xs text-gray-500">Currently operating</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-600">{stats?.stats?.activeVendors || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Active Users</p>
                  <p className="text-xs text-gray-500">Currently active</p>
                </div>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats?.stats?.activeUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Rejected Vendors</p>
                  <p className="text-xs text-gray-500">Approval denied</p>
                </div>
              </div>
              <span className="text-lg font-bold text-red-600">{stats?.stats?.rejectedVendors || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Vendor Requests */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Vendor Approval Requests</h3>
            <a href="/vendors?status=pending" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="space-y-3">
            {recentVendors.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending vendor requests</p>
              </div>
            ) : (
              recentVendors.map((vendor) => (
                <div
                  key={vendor._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-700">
                        {vendor.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                      <p className="text-xs text-gray-500">{vendor.email} · {vendor.registrationType}</p>
                    </div>
                  </div>
                  <span className="badge bg-yellow-100 text-yellow-800">Pending</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
