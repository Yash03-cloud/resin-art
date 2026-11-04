import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/compat-router';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  LockClosedIcon,
  TruckIcon,
  CheckCircleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';
import { createOrder } from '../services/api';
import toast from 'react-hot-toast';

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

const STEPS = ['Shipping Address', 'Cash on Delivery', 'Confirmed'];

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingForm | null>(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');
  const { items, getSubtotal, getTotal, getDiscount, couponCode, clearCart } = useCartStore();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();
  const shipping = subtotal >= 1000 ? 0 : 99;
  const finalTotal = total + shipping;

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingForm>();

  const onShippingSubmit = (data: ShippingForm) => {
    setShippingData(data);
    setStep(1);
  };

  const handlePayment = async () => {
    if (!shippingData) {
      toast.error('Please complete shipping details first');
      setStep(0);
      return;
    }
    setLoading(true);
    try {
      const firstPhotoItem = items.find((i) => i.customImage);
      const order = await createOrder({
        customer: `${shippingData.firstName} ${shippingData.lastName}`,
        email: shippingData.email,
        phone: shippingData.phone,
        address: `${shippingData.address}, ${shippingData.city}, ${shippingData.state} - ${shippingData.pincode}${
          shippingData.landmark ? ` (Landmark: ${shippingData.landmark})` : ''
        }`,
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price - (item.price * item.discount) / 100,
          quantity: item.quantity,
          image: item.image,
          customImage: item.customImage || '',
          customNote: item.customNote || '',
          isPhotoFrame: Boolean(item.isPhotoFrame),
        })),
        customImage: firstPhotoItem?.customImage || '',
        customNote: firstPhotoItem?.customNote || '',
        paymentMethod: 'cod',
        amount: finalTotal,
      });

      setConfirmedOrderId(order.id);
      clearCart();
      setStep(2);
      toast.success('Order placed successfully with Cash on Delivery! 📦');
    } catch (err) {
      console.error('Order creation error:', err);
      toast.error('Could not complete order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0 && step !== 2) {
      navigate('/cart');
    }
  }, [items.length, step, navigate]);

  if (items.length === 0 && step !== 2) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-max py-10 max-w-5xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 sm:mb-12 px-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold transition-all ${step > i
                    ? 'bg-green-500 text-white'
                    : step === i
                      ? 'bg-purple-600 text-white shadow-glow'
                      : 'bg-gray-200 text-gray-500'
                  }`}
              >
                {step > i ? <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : i + 1}
              </div>
              <span className={`ml-1.5 sm:ml-2 text-xs sm:text-sm font-medium ${step === i ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className={`w-6 sm:w-16 md:w-24 h-0.5 sm:h-1 mx-1.5 sm:mx-3 rounded-full transition-all ${step > i ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* STEP 1: Shipping */}
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
              >
                <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <TruckIcon className="w-7 h-7 text-purple-500" />
                  Shipping Address
                </h2>
                <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
                      <input
                        {...register('firstName', { required: 'Required' })}
                        className="input-field"
                        placeholder="First Name"
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
                      <input
                        {...register('lastName', { required: 'Required' })}
                        className="input-field"
                        placeholder="Last Name"
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                    <input
                      {...register('email', {
                        required: 'Required',
                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' },
                      })}
                      type="email"
                      className="input-field"
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                    <input
                      {...register('phone', {
                        required: 'Required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit number' },
                      })}
                      type="tel"
                      className="input-field"
                      placeholder="7218700468"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Address *</label>
                    <textarea
                      {...register('address', { required: 'Required' })}
                      rows={2}
                      className="input-field resize-none"
                      placeholder="House No., Street, Area..."
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                      <input {...register('city', { required: 'Required' })} className="input-field" placeholder="wardha" />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                      <input {...register('state', { required: 'Required' })} className="input-field" placeholder="Maharashtra" />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                      <input
                        {...register('pincode', { required: 'Required', pattern: { value: /^\d{6}$/, message: '6 digits' } })}
                        className="input-field"
                        placeholder="400001"
                      />
                      {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Landmark (Optional)</label>
                    <input {...register('landmark')} className="input-field" placeholder="Near XYZ mall" />
                  </div>

                  <button type="submit" className="btn-primary w-full py-4 text-base justify-center mt-2">
                    Continue to Payment →
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: Payment */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
              >
                <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <TruckIcon className="w-7 h-7 text-purple-500" />
                  Payment Method
                </h2>

                {/* Shipping Summary */}
                {shippingData && (
                  <div className="bg-purple-50 rounded-2xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-gray-800">{shippingData.firstName} {shippingData.lastName}</p>
                        <p className="text-gray-600">{shippingData.address}</p>
                        <p className="text-gray-600">{shippingData.city}, {shippingData.state} - {shippingData.pincode}</p>
                        <p className="text-gray-600">{shippingData.phone}</p>
                      </div>
                      <button onClick={() => setStep(0)} className="ml-auto text-purple-600 text-xs font-medium hover:underline">
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {/* Cash on Delivery Only */}
                <div className="mb-6">
                  <div className="flex items-start gap-4 p-5 rounded-2xl border-2 border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 dark:border-purple-400">
                    <span className="text-3xl">💵</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                          Cash on Delivery (COD)
                        </span>
                        <span className="badge badge-primary text-xs font-semibold">Only Payment Option</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                        Pay cash directly to our delivery partner or scan UPI QR upon arrival at your doorstep. No advance online payment needed!
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl w-fit">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Zero upfront risk • Inspect upon arrival</span>
                      </div>
                    </div>
                    <CheckCircleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0 mt-1" />
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                  <LockClosedIcon className="w-4 h-4 text-green-500" />
                  Order confirmation and tracking link sent via SMS & WhatsApp
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="btn-secondary flex-1 py-3 justify-center"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="btn-primary flex-1 py-3 text-base justify-center disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Placing Order...
                      </span>
                    ) : (
                      <>Place Order (COD) - ₹{finalTotal.toLocaleString('en-IN')} 📦</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Confirmation */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center"
              >
                <div className="inline-block bg-purple-50/70 p-3 rounded-2xl mb-6 border border-purple-100">
                  <img src="/logo.png" alt="Artvibe by Charu" className="h-12 w-auto object-contain mx-auto" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircleIcon className="w-12 h-12 text-green-500" />
                </motion.div>
                <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-3">Order Confirmed! 🎉</h2>
                <p className="text-gray-500 text-lg mb-6">
                  Thank you for your order! We'll start crafting your resin art with love.
                </p>
                <div className="bg-purple-50 rounded-2xl p-5 mb-8 inline-block">
                  <p className="text-sm text-gray-600 mb-1">Your Order ID</p>
                  <p className="font-bold text-purple-700 text-xl">
                    {confirmedOrderId}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-sm text-gray-600 space-y-2">
                  <p>📧 Confirmation email sent to <strong>{shippingData?.email}</strong></p>
                  <p>🚚 Expected delivery: <strong>5-7 business days</strong></p>
                  <p>📱 You'll receive WhatsApp updates on <strong>{shippingData?.phone}</strong></p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate(`/track-order?id=${confirmedOrderId}`)}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <TruckIcon className="w-5 h-5" />
                    Track Live Shipment
                  </button>
                  <button onClick={() => navigate('/shop')} className="btn-secondary">
                    Continue Shopping ✨
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step < 2 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-5 text-lg">Order Summary</h3>
              <div className="space-y-4 mb-5">
                {items.map((item) => {
                  const itemPrice = item.price - (item.price * item.discount) / 100;
                  return (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="relative">
                        <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-lg" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</p>
                        {item.customImage && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <img
                              src={item.customImage}
                              alt="Frame Photo"
                              className="w-5 h-5 rounded object-cover border border-purple-200"
                            />
                            <span className="text-[11px] text-purple-700 font-medium">Custom Photo Attached</span>
                          </div>
                        )}
                        {item.discount > 0 && (
                          <p className="text-xs text-purple-500">-{item.discount}% off</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 shrink-0">
                        ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({couponCode})</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-purple-700">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
