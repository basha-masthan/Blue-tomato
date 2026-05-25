import { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  CreditCard,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';
import apiClient from '../api/client';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/transactions');
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await apiClient.get('/transactions/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.monthlyRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.pendingAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Transaction ID</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Vendor</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Order</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Amount</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr key={txn._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-gray-900">{txn.transactionId}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-900">{txn.vendor?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{txn.vendor?.email || ''}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-600">{txn.order?.orderNumber || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(txn.amount)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`badge ${
                      txn.status === 'payment_received'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {txn.status === 'payment_received' ? 'Received' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
