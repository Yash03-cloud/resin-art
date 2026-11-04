import { useState } from 'react';
import { Link, useNavigate } from '@/lib/compat-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  TagIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon, couponCode, couponDiscount, getSubtotal, getTotal, getDiscount } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();
  const shipping = subtotal >= 1000 ? 0 : 99;
  const finalTotal = total + shipping;

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput);
    if (success) {
      toast.success('Coupon applied successfully! 🎉');
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try RESIN10');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md px-4"
        >
          <div className="inline-block bg-white/95 preserve-white p-3 rounded-3xl shadow-sm border border-purple-100 mb-6">
            <img src="/logo.png" alt="Artvibe by Charu" className="h-14 sm:h-16 w-auto object-contain mx-auto" />
          </div>
          <h2 className="font-playfair text-3xl font-bold text-gray-900 dark:text-white mb-4">Your Cart is Empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
            Looks like you haven't added any beautiful resin art yet!
          </p>
          <Link to="/shop" className="btn-primary text-lg px-10 py-4">
            Start Shopping ✨
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 pt-16 sm:pt-20">
      <div className="container-max py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Shopping Cart
            <span className="ml-2 text-sm sm:text-base font-poppins font-normal text-gray-400">({items.length} items)</span>
          </h1>
          <button
            onClick={() => { clearCart(); toast('Cart cleared'); }}
            className="text-xs sm:text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 self-start sm:self-auto"
          >
            <TrashIcon className="w-4 h-4" />
            Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <AnimatePresence>
              {items.map((item, i) => {
                const itemPrice = item.price - (item.price * item.discount) / 100;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-3.5 sm:gap-5"
                  >
                    {/* Product Image */}
                    <Link to={`/product/${item.id}`} className="shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl hover:scale-105 transition-transform"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/product/${item.id}`}
                            className="font-semibold text-gray-800 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors block text-sm sm:text-base mb-1 line-clamp-2"
                          >
                            {item.title}
                          </Link>
                          {item.discount > 0 && (
                            <span className="badge badge-primary text-[10px] sm:text-xs">-{item.discount}% OFF</span>
                          )}
                          {item.customImage && (
                            <div className="mt-2 p-2 sm:p-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 flex items-center gap-2.5">
                              <img
                                src={item.customImage}
                                alt="Custom Frame Photo"
                                className="w-11 h-11 sm:w-12 sm:h-12 object-cover rounded-lg border border-purple-300 dark:border-purple-700 shrink-0 shadow-xs"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                                  <span>🖼️</span> Custom Frame Photo Attached
                                </p>
                                {item.customNote ? (
                                  <p className="text-[11px] text-gray-600 dark:text-gray-300 truncate mt-0.5">
                                    Inscription: <span className="italic">"{item.customNote}"</span>
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Ready to embed in resin frame
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => { removeItem(item.id); toast('Item removed'); }}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors shrink-0"
                          aria-label="Remove item"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2">
                        {/* Quantity */}
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl overflow-hidden bg-gray-50/50 dark:bg-gray-700/50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <span className="px-2.5 sm:px-4 py-0.5 sm:py-1 font-semibold text-xs sm:text-sm text-gray-800 dark:text-gray-100">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200"
                            disabled={item.quantity >= item.stock}
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="font-bold text-purple-700 text-base sm:text-lg">
                            ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-gray-400 text-[11px] sm:text-xs">
                              ₹{itemPrice.toLocaleString('en-IN')} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Continue Shopping */}
            <Link
              to="/shop"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm mt-4"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Coupon Code */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-purple-500" />
                Have a Coupon?
              </h3>
              {couponCode ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl p-3">
                  <div>
                    <span className="font-bold text-green-700 dark:text-green-300">{couponCode}</span>
                    <p className="text-green-600 dark:text-green-400 text-xs">-₹{couponDiscount.toLocaleString('en-IN')} off applied!</p>
                  </div>
                  <button onClick={removeCoupon} className="text-red-400 hover:text-red-600">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      placeholder="Enter coupon code"
                      className="input-field flex-1 text-sm py-2.5"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="btn-primary px-4 py-2.5 text-sm whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                  <p className="text-gray-400 text-xs mt-2">Try: RESIN10 (10% off)</p>
                </>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-5 text-lg">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Coupon Discount ({couponCode})</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Add ₹{(1000 - subtotal).toLocaleString('en-IN')} more for FREE shipping! 🚚
                  </p>
                )}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-2">
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white text-lg">
                    <span>Total</span>
                    <span className="text-purple-700 dark:text-purple-400">₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full mt-6 py-4 text-base justify-center"
              >
                Proceed to Checkout
                <ArrowRightIcon className="w-5 h-5" />
              </button>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                {['💵 Cash on Delivery', '🚚 Fast Delivery', '🔒 100% Safe'].map((badge) => (
                  <span key={badge} className="text-xs text-gray-500 dark:text-gray-400 font-medium">{badge}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
