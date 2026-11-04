import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from '@/lib/compat-router';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  ArchiveBoxIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { fetchOrderById } from '../services/api';

const ORDER_STATUSES = [
  { key: 'Pending', label: 'Order Placed', icon: <ClockIcon className="w-5 h-5" />, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { key: 'Confirmed', label: 'Confirmed', icon: <CheckCircleIcon className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-100' },
  { key: 'Processing', label: 'Processing', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  { key: 'Creating Artwork', label: 'Creating Artwork', icon: <CubeIcon className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-100' },
  { key: 'Packing', label: 'Packing', icon: <ArchiveBoxIcon className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-100' },
  { key: 'Shipped', label: 'Shipped', icon: <TruckIcon className="w-5 h-5" />, color: 'text-teal-500', bg: 'bg-teal-100' },
  { key: 'Out For Delivery', label: 'Out For Delivery', icon: <MapPinIcon className="w-5 h-5" />, color: 'text-green-500', bg: 'bg-green-100' },
  { key: 'Delivered', label: 'Delivered', icon: <CheckCircleIcon className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' },
];

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const trackOrder = useCallback(async (idToTrack: string) => {
    const cleanId = idToTrack.trim().toUpperCase();
    if (!cleanId) {
      setError('Please enter your order ID');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await fetchOrderById(cleanId);
      if (data) {
        setOrder({
          ...data,
          product: data.product || (data.items && data.items.map((i: any) => `${i.quantity}x ${i.title}`).join(', ')) || 'Handcrafted Resin Art',
          payment: (data as any).paymentStatus || (data as any).payment || 'Cash on Delivery (Pending)',
        });
        setError('');
      } else {
        setOrder(null);
        setError(`Order "${cleanId}" not found in our database. Please check your order ID or contact WhatsApp support.`);
      }
    } catch {
      setOrder(null);
      setError(`Unable to search order "${cleanId}". Please check your order ID or contact WhatsApp support.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const queryId = searchParams.get('id');
    if (queryId) {
      setOrderId(queryId.toUpperCase());
      trackOrder(queryId);
    }
  }, [searchParams, trackOrder]);

  const handleTrack = () => {
    trackOrder(orderId);
  };

  const currentStatusIndex = order
    ? ORDER_STATUSES.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 pt-20">
      {/* Header */}
      <div className="bg-gradient-hero py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1614289371518-722f2615943d?w=1600" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative container-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-block bg-white/95 px-4 py-2 rounded-2xl shadow-xl mb-4">
              <img src="/logo.png" alt="Artvibe by Charu" className="h-12 w-auto object-contain mx-auto" />
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">Track Your Order</h1>
            <p className="text-purple-200 text-lg">Enter your order ID to see live status updates</p>
          </motion.div>
        </div>
      </div>

      <div className="container-max py-10 max-w-4xl">
        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8"
        >
          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-6">Enter Order ID</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                placeholder="e.g., ORD001"
                className="input-field pl-12 text-base sm:text-lg"
              />
            </div>
            <button
              onClick={handleTrack}
              disabled={loading}
              className="btn-primary px-7 py-3.5 text-sm sm:text-base justify-center disabled:opacity-70 whitespace-nowrap"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
              ⚠️ {error}
            </p>
          )}
          <p className="text-gray-400 text-sm mt-3">Demo orders: ORD001, ORD002, ORD003</p>
        </motion.div>

        {/* Order Results */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Order Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide mb-3">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order ID:</span>
                      <span className="font-semibold text-purple-700">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Product:</span>
                      <span className="font-medium">{order.product}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-medium">₹{order.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment:</span>
                      <span className={`badge ${order.payment === 'Paid' ? 'badge-success' : 'badge-danger'}`}>
                        {order.payment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order Date:</span>
                      <span>{order.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Est. Delivery:</span>
                      <span className="font-semibold text-green-600">{order.estimatedDelivery}</span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">AWB Tracking:</span>
                        <span className="font-mono text-purple-600 font-semibold">{order.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg text-xs shrink-0 border border-gray-200">
                          {item.image && (
                            <img src={item.image} alt={item.title} className="w-8 h-8 rounded object-cover" />
                          )}
                          <span className="font-medium text-gray-700 max-w-[130px] truncate">{item.title}</span>
                          <span className="text-purple-600 font-bold">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide mb-3">Delivery Address</h3>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPinIcon className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{order.customer}</p>
                      <p className="text-gray-600 dark:text-gray-300">{order.address}</p>
                    </div>
                  </div>

                  {/* Current Status Badge */}
                  <div className="mt-4">
                    {(() => {
                      const statusInfo = ORDER_STATUSES.find((s) => s.key === order.status);
                      return statusInfo ? (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg}`}>
                          <span className={statusInfo.color}>{statusInfo.icon}</span>
                          <span className={`font-semibold ${statusInfo.color}`}>{order.status}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-8">Order Journey</h3>

              {/* Visual Progress Bar */}
              <div className="relative mb-10 overflow-x-auto">
                <div className="flex min-w-max md:min-w-0">
                  {ORDER_STATUSES.map((status, i) => {
                    const isCompleted = i <= currentStatusIndex;
                    const isCurrent = i === currentStatusIndex;
                    return (
                      <div key={status.key} className="flex items-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex flex-col items-center relative"
                          style={{ minWidth: '80px' }}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${isCompleted
                                ? isCurrent
                                  ? 'bg-purple-600 text-white shadow-glow ring-4 ring-purple-200'
                                  : 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-400'
                              }`}
                          >
                            {isCompleted && !isCurrent ? (
                              <CheckCircleIcon className="w-5 h-5" />
                            ) : (
                              status.icon
                            )}
                          </div>
                          <span className={`text-xs text-center leading-tight ${isCompleted ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                            {status.label}
                          </span>
                        </motion.div>
                        {i < ORDER_STATUSES.length - 1 && (
                          <div
                            className={`h-1 transition-all mx-1`}
                            style={{
                              width: '24px',
                              background: i < currentStatusIndex ? '#22C55E' : '#E5E7EB',
                              borderRadius: '9999px',
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline */}
              <h4 className="font-semibold text-gray-800 mb-4">Activity Timeline</h4>
              <div className="space-y-4">
                {[...order.timeline].reverse().map((event, i) => {
                  const statusInfo = ORDER_STATUSES.find((s) => s.key === event.status);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-4"
                    >
                      <div className={`w-8 h-8 rounded-full ${statusInfo?.bg || 'bg-gray-100'} flex items-center justify-center shrink-0 ${statusInfo?.color || 'text-gray-400'}`}>
                        {statusInfo?.icon}
                      </div>
                      <div className="flex-1 pb-4 border-b border-gray-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{event.status}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{event.note}</p>
                          </div>
                          <span className="text-gray-400 text-xs shrink-0 ml-3">{event.date}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-purple-50 rounded-2xl p-6 text-center">
              <p className="text-gray-600 mb-3">Need help with your order?</p>
              <div className="flex gap-3 justify-center">
                <a
                  href={`https://wa.me/917218700468?text=I need help with order ${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm py-2.5 px-5"
                >
                  WhatsApp Support
                </a>
                <a href="mailto:support@resinart.studio" className="btn-secondary text-sm py-2.5 px-5">
                  Email Us
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
