import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { forgotPassword } from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [accountFound, setAccountFound] = useState<{
    name: string;
    email: string;
    maskedEmail?: string;
    phone?: string;
  } | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'find' | 'reset' | 'success'>('find');

  const navigate = useNavigate();

  // Step 1: Search for user account
  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'email' && !emailInput.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (tab === 'phone' && !phoneInput.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const payload = tab === 'email' ? { email: emailInput.trim() } : { phone: phoneInput.trim() };
      const res = await forgotPassword(payload);

      if (res.isAdmin) {
        toast.error(res.message || 'Admin account cannot be reset here. Contact studio hotline.');
        return;
      }

      if (res.success && res.exists) {
        setAccountFound({
          name: res.name,
          email: res.email,
          maskedEmail: res.maskedEmail || res.email,
          phone: res.phone,
        });
        setStep('reset');
        toast.success(`Account found for ${res.name}!`);
      } else {
        toast.error(res.message || 'No account found. Check details or recover via WhatsApp.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No account found with this information.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFound) return;

    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({
        email: accountFound.email,
        newPassword,
      });

      if (res.success) {
        setStep('success');
        toast.success('Password updated successfully! 🎉');
      } else {
        toast.error(res.message || 'Failed to update password');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const waHelpLink = `https://wa.me/917218700468?text=${encodeURIComponent(
    `Hello Charu, I need help recovering my account on Artvibe by Charu. My details: ${emailInput ? `Email: ${emailInput}` : ''} ${phoneInput ? `Phone: ${phoneInput}` : ''}`
  )}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex">
      {/* Left Artwork Banner (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200"
          alt="Resin Art Studio"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/85 to-black/75" />
        <div className="relative flex flex-col justify-between p-16 text-white h-full">
          <Link to="/" className="flex items-center gap-3.5">
            <div className="bg-white/95 p-2 rounded-2xl shadow-md border border-white/20">
              <img src="/logo.png" alt="Artvibe by Charu" className="h-12 w-auto object-contain" />
            </div>
            <div>
              <div className="font-playfair text-2xl font-bold">Artvibe</div>
              <div className="text-amber-300 text-xs font-semibold tracking-widest uppercase">by Charu</div>
            </div>
          </Link>

          <div>
            <span className="badge badge-primary mb-3">Account Security</span>
            <h2 className="font-playfair text-4xl font-bold mb-4 leading-tight">
              Reset Your Password
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-md">
              Forgot your password or login email? We make it simple and secure to recover your Artvibe account and get back to your custom artwork.
            </p>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 max-w-md text-xs text-purple-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center shrink-0 text-lg">
              💬
            </div>
            <div>
              <p className="font-semibold text-white">Need Personal Help?</p>
              <p className="text-purple-200">Our studio support is available on WhatsApp: +91 7218700468</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Top Brand */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="bg-white p-1.5 rounded-xl shadow-xs border border-purple-100">
                <img src="/logo.png" alt="Artvibe by Charu" className="h-9 w-auto object-contain" />
              </div>
              <div className="text-left">
                <span className="font-playfair text-lg font-bold text-gray-900 dark:text-white block leading-tight">Artvibe</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold tracking-wider uppercase">by Charu</span>
              </div>
            </Link>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>

          {/* SUCCESS VIEW */}
          {step === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs">
                <CheckCircleIcon className="w-10 h-10" />
              </div>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Password Reset Successfully!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Your new password has been saved to the database. You can now log into your account with your updated credentials.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full py-3.5 justify-center text-sm font-semibold shadow-md"
              >
                Sign In Now →
              </button>
            </motion.div>
          ) : step === 'reset' && accountFound ? (
            /* STEP 2: ENTER NEW PASSWORD */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 text-xl">
                <KeyIcon className="w-6 h-6" />
              </div>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Choose a New Password
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                Setting new password for <strong className="text-purple-600 dark:text-purple-400">{accountFound.name}</strong> ({accountFound.maskedEmail || accountFound.email})
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    New Password (min 6 characters) *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="input-field text-sm pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="input-field text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 justify-center text-sm font-semibold shadow-md disabled:opacity-70"
                  >
                    {loading ? 'Saving New Password...' : 'Save Password & Sign In ✨'}
                  </button>
                </div>
              </form>

              <button
                type="button"
                onClick={() => setStep('find')}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-4 cursor-pointer"
              >
                ← Back to search account
              </button>
            </motion.div>
          ) : (
            /* STEP 1: FIND ACCOUNT (BY EMAIL OR BY PHONE) */
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-xl">
              <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Forgot Account?
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-6">
                Enter your email or phone number to find your account and set a new password.
              </p>

              {/* Tab Selector: Email vs Phone */}
              <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-900 p-1 mb-6 border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setTab('email')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tab === 'email'
                      ? 'bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  <EnvelopeIcon className="w-3.5 h-3.5" />
                  <span>I Know My Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab('phone')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tab === 'phone'
                      ? 'bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  <PhoneIcon className="w-3.5 h-3.5" />
                  <span>Forgot My Email</span>
                </button>
              </div>

              <form onSubmit={handleFindAccount} className="space-y-4">
                {tab === 'email' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Your Registered Email Address *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="e.g. you@example.com"
                        required
                        className="input-field text-sm pl-10"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Your Registered Phone Number *
                    </label>
                    <div className="relative">
                      <PhoneIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="e.g. 9876543210"
                        required
                        className="input-field text-sm pl-10"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      We'll search your account by phone and reveal your registered email address.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 justify-center text-sm font-semibold shadow-md disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Searching Account...
                    </span>
                  ) : (
                    'Find Account & Reset Password →'
                  )}
                </button>
              </form>

              {/* Direct WhatsApp Recovery Card */}
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700/60">
                <div className="p-3.5 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/60 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <span>Prefer WhatsApp Help?</span>
                      <span>💬</span>
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      Charu can instantly verify and recover your account.
                    </p>
                  </div>
                  <a
                    href={waHelpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-xs"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Remember your details?{' '}
              <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                Sign In here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
