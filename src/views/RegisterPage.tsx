import { useState } from 'react';
import { Link, useNavigate } from '@/lib/compat-router';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { registerUser } from '../services/api';
import toast from 'react-hot-toast';

interface RegisterForm {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>();
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      if (res.success && res.user) {
        login(res.user, res.token);
        toast.success(res.message || `Welcome to Artvibe by Charu, ${data.name.split(' ')[0]}! 🎨`);
        navigate('/');
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pwd: string = '') => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = passwordStrength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'][strength];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex">
      {/* Left - Art Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200"
          alt="Resin Art"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-black/60" />
        <div className="relative flex flex-col justify-center p-16 text-white">
          <Link to="/" className="flex items-center gap-3.5 mb-12">
            <div className="bg-white/95 p-2 rounded-2xl shadow-md border border-white/20">
              <img
                src="/logo.png"
                alt="Artvibe by Charu"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <div className="font-playfair text-2xl font-bold">Artvibe</div>
              <div className="text-amber-300 text-xs font-semibold tracking-widest uppercase">by Charu</div>
            </div>
          </Link>
          <h2 className="font-playfair text-4xl font-bold mb-6 leading-tight">
            Start Your Resin Art Journey
          </h2>
          <p className="text-white/70 text-lg mb-10">
            Join 1,200+ customers who love our handcrafted resin art masterpieces.
          </p>
          <div className="space-y-4">
            {[
              '🎨 Browse 48+ unique products',
              '💎 Access custom order requests',
              '🎁 Exclusive member discounts',
              '📦 Easy order tracking',
              '❤️ Curate your wishlist',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-white/80">
                <CheckCircleIcon className="w-5 h-5 text-green-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-xl shadow-xs border border-purple-100">
                <img
                  src="/logo.png"
                  alt="Artvibe by Charu"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="text-left">
                <span className="font-playfair text-xl font-bold text-gray-900 dark:text-white block leading-tight">Artvibe</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold tracking-wider uppercase">by Charu</span>
              </div>
            </Link>
          </div>

          <h1 className="font-playfair text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Join our creative family today — it's free!</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
              <input
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
                className="input-field"
                placeholder="Your Full Name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' },
                })}
                type="email"
                className="input-field"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number (Optional - for order updates & easy recovery)</label>
              <input
                {...register('phone')}
                type="tel"
                className="input-field"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-green-500'}`}>
                    {strengthLabel} password
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password *</label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === password || 'Passwords do not match',
                })}
                type="password"
                className="input-field"
                placeholder="Repeat password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                {...register('terms', { required: 'You must accept the terms' })}
                id="terms"
                className="mt-1 rounded border-gray-300 text-purple-600"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
                I agree to the{' '}
                <Link to="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms.message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base justify-center disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account...
                </span>
              ) : 'Create Account ✨'}
            </button>
          </form>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
