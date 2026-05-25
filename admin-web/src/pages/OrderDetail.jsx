import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  ClipboardList,
  CreditCard,
  MapPin,
  Calendar,
  Clock,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import apiClient from '../api/client';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setStatusLoading(true);
    try {
      await apiClient.patch(`/orders/${id}/status`, { status: newStatus });
      fetchOrder();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <button onClick={() => navigate('/orders')} className="btn-primary mt-4">
          Back to Orders
        </button>
      </div>
    );
  }

  const statusFlow = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentStatusIndex = statusFlow.indexOf(order.status);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Orders</span>
      </button>

      {/* Order Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{order.orderNumber}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Flow */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
        <div className="flex items-center justify-between">
          {statusFlow.map((status, index) => (
            <div key={status} className="flex flex-col items-center flex-1 relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                  index <= currentStatusIndex
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                } ${order.status === 'cancelled' ? 'bg-red-600 text-white' : ''}`}
              >
                {index + 1}
              </div>
              <span className="text-xs mt-2 capitalize text-gray-600 hidden sm:block">{status.replace(/_/g, ' ')}</span>
              {index < statusFlow.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    index < currentStatusIndex ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <div className="mt-6 flex flex-wrap gap-2">
            {statusFlow
              .slice(currentStatusIndex + 1, currentStatusIndex + 2)
              .map((nextStatus) => (
                <button
                  key={nextStatus}
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={statusLoading}
                  className="btn-primary text-sm"
                >
                  {statusLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    `Mark as ${nextStatus.replace(/_/g, ' ')}`
                  )}
                </button>
              ))}
            <button
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={statusLoading}
              className="btn-danger text-sm"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-900">{order.userId?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{order.userId?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{order.userId?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h3>
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-900">{order.restaurantId?.name || 'N/A'}</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
          {order.deliveryAddress && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900">{order.deliveryAddress.addressLine1}</p>
                <p className="text-sm text-gray-600">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Payment Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 capitalize">{order.paymentMethod}</span>
            </div>
            <p className="text-sm">
              <span className="text-gray-500">Status:</span>{' '}
              <span className={order.isPaid ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                {order.isPaid ? 'Paid' : 'Pending'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.items?.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-sm font-medium text-gray-700">
                  {item.quantity}x
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  {item.variant?.name && (
                    <p className="text-xs text-gray-500">{item.variant.name}</p>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        {/* Pricing Breakdown */}
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Item Total</span>
            <span className="text-gray-900">{formatCurrency(order.pricing?.itemTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Delivery Fee</span>
            <span className="text-gray-900">{formatCurrency(order.pricing?.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax</span>
            <span className="text-gray-900">{formatCurrency(order.pricing?.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Platform Fee</span>
            <span className="text-gray-900">{formatCurrency(order.pricing?.platformFee)}</span>
          </div>
          {order.pricing?.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Discount</span>
              <span className="text-green-600">-{formatCurrency(order.pricing?.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span className="text-gray-900">Grand Total</span>
            <span className="text-primary-600">{formatCurrency(order.pricing?.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
