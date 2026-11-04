import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  CheckCircleIcon,
  PhotoIcon,
  SparklesIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';
import { submitCustomOrder } from '../services/api';
import toast from 'react-hot-toast';

interface CustomOrderForm {
  name: string;
  email: string;
  phone: string;
  productType: string;
  designInstructions: string;
  dimensions?: string;
  colorPreferences?: string;
  budget: string;
  deadline?: string;
  referenceNote?: string;
}

const productTypes = [
  'Galaxy/Cosmic Wall Art',
  'Abstract Resin Painting',
  'Geode/Crystal Art',
  'Ocean Wave Art',
  'Resin Coasters (Set)',
  'Resin Keychain',
  'Resin Jewellery (Necklace)',
  'Resin Jewellery (Earrings)',
  'Resin Jewellery (Bracelet)',
  'Photo Frame',
  'Name/Initial Plaque',
  'Resin Tray/Serving Board',
  'Terrarium Paperweight',
  'Wedding/Event Gift',
  'Custom - Tell me more',
];

const budgetRanges = [
  '₹500 – ₹1,000',
  '₹1,000 – ₹2,500',
  '₹2,500 – ₹5,000',
  '₹5,000 – ₹10,000',
  '₹10,000+',
];

const todayDate = new Date().toISOString().split('T')[0];

export default function CustomOrderPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CustomOrderForm>();

  const onSubmit = async (data: CustomOrderForm) => {
    setLoading(true);
    try {
      await submitCustomOrder({
        name: data.name,
        email: data.email,
        phone: data.phone,
        productType: data.productType,
        colorPreferences: data.colorPreferences,
        dimensions: data.dimensions,
        designInstructions: data.designInstructions,
        budget: data.budget,
        deadline: data.deadline,
      });
      setSubmitted(true);
      reset();
      toast.success('Custom order request submitted! We\'ll respond within 12 hours. ✨');
    } catch {
      toast.error('Could not submit custom order request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setUploadedFile(file);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg p-10 bg-white rounded-3xl shadow-lg"
        >
          <div className="inline-block bg-purple-50/70 p-3 rounded-2xl mb-4 border border-purple-100">
            <img src="/logo.png" alt="Artvibe by Charu" className="h-12 w-auto object-contain mx-auto" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircleIcon className="w-12 h-12 text-green-500" />
          </motion.div>
          <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-3">Request Submitted! ✨</h2>
          <p className="text-gray-500 text-lg mb-3">
            Thank you for your custom order request!
          </p>
          <p className="text-gray-400 mb-8">
            We'll review your requirements and contact you within 12 hours to discuss your project.
          </p>
          <div className="bg-purple-50 rounded-2xl p-4 mb-8">
            <p className="text-sm text-purple-700 font-medium">
              📱 We'll also reach out on WhatsApp for a quick chat about your vision!
            </p>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-primary px-8 py-3"
          >
            Submit Another Request
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 pt-20">
      {/* Header */}
      <div className="bg-gradient-hero py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img src="https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1600" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative container-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-block bg-white/95 px-4 py-2 rounded-2xl shadow-xl mb-4">
              <img src="/logo.png" alt="Artvibe by Charu" className="h-12 w-auto object-contain mx-auto" />
            </div>
            <h1 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-4">Custom Order</h1>
            <p className="text-purple-200 text-xl max-w-2xl mx-auto">
              Have something unique in mind? We'll bring your vision to life with our expert resin craftsmanship.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-max py-12 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Meet Charu - Artisan Spotlight */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-purple-500/30 overflow-hidden relative">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-300 shadow-md shrink-0">
                  <img src="/charu.jpg" alt="Charu - Master Resin Artist" className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <span className="badge badge-accent text-[10px] mb-1">Master Artisan</span>
                  <h4 className="font-playfair text-lg font-bold text-white">Handcrafted by Charu</h4>
                  <p className="text-purple-200 text-xs">Wardha Studio, India</p>
                </div>
              </div>
              <p className="text-purple-100/90 text-xs leading-relaxed">
                "Every custom piece is personally designed and poured by me. Share your dream colors, flowers, or themes and let's craft magic together!"
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-5">How It Works</h3>
              {[
                { step: '01', title: 'Submit Request', desc: 'Fill out the form with your requirements and vision.' },
                { step: '02', title: 'Consultation', desc: "We'll discuss your ideas and provide a quote within 12 hours." },
                { step: '03', title: 'Payment', desc: '50% advance to begin crafting your masterpiece.' },
                { step: '04', title: 'Creation', desc: 'We craft your art with love. Updates via WhatsApp.' },
                { step: '05', title: 'Delivery', desc: 'Carefully packed and delivered to your doorstep.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 mb-5 last:mb-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{item.title}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-6 border border-amber-100 dark:border-amber-800/60">
              <CurrencyRupeeIcon className="w-8 h-8 text-amber-500 mb-3" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Pricing Guide</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>🔑 Keychains: from ₹350</li>
                <li>💎 Jewellery: from ₹650</li>
                <li>🖼️ Frames: from ₹1,200</li>
                <li>☕ Coasters (set of 4): from ₹1,200</li>
                <li>🎨 Wall Art (small): from ₹2,500</li>
                <li>🎨 Wall Art (large): from ₹5,000</li>
              </ul>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 font-medium">
                * Final price depends on size, complexity, and materials.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-6 border border-green-100 dark:border-green-800/60">
              <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">💬 Prefer to Chat?</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Contact us directly on WhatsApp for instant help.</p>
              <a
                href="https://wa.me/917218700468?text=I'd like to place a custom resin order!"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                WhatsApp Now 💬
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-6">Tell Us About Your Vision</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Name *</label>
                    <input
                      {...register('name', { required: 'Required' })}
                      className="input-field"
                      placeholder="Your Full Name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                    <input
                      {...register('phone', {
                        required: 'Required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid number' },
                      })}
                      type="tel"
                      className="input-field"
                      placeholder="7218700468"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Type *</label>
                  <select {...register('productType', { required: 'Required' })} className="input-field">
                    <option value="">Select a product type...</option>
                    {productTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.productType && <p className="text-red-500 text-xs mt-1">{errors.productType.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Dimensions (if known)</label>
                    <input {...register('dimensions')} className="input-field" placeholder="e.g. 12x16 inches" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Color Preferences</label>
                    <input {...register('colorPreferences')} className="input-field" placeholder="e.g. Blues, golds, purple" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Design Instructions *</label>
                  <textarea
                    {...register('designInstructions', {
                      required: 'Please describe your design',
                      minLength: { value: 30, message: 'Please provide more details (min 30 chars)' },
                    })}
                    rows={5}
                    className="input-field resize-none"
                    placeholder="Describe your vision in detail. What theme, colors, occasion is this for? Any specific elements you want included? The more detail, the better!"
                  />
                  {errors.designInstructions && <p className="text-red-500 text-xs mt-1">{errors.designInstructions.message}</p>}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Reference Image (Optional)
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                      dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])}
                    />
                    {uploadedFile ? (
                      <div>
                        <CheckCircleIcon className="w-10 h-10 text-green-500 mx-auto mb-2" />
                        <p className="font-medium text-green-700">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-400">{(uploadedFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    ) : (
                      <div>
                        <PhotoIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          <span className="text-purple-600 font-medium">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-gray-400 text-xs mt-1">PNG, JPG, PDF up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Estimated Budget *</label>
                    <select {...register('budget', { required: 'Required' })} className="input-field">
                      <option value="">Select budget range...</option>
                      {budgetRanges.map((range) => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                    {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Needed By (Optional)</label>
                    <input
                      {...register('deadline')}
                      type="date"
                      className="input-field"
                      min={todayDate}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes</label>
                  <textarea
                    {...register('referenceNote')}
                    rows={2}
                    className="input-field resize-none"
                    placeholder="Any special requirements, gift message, packaging preferences..."
                  />
                </div>

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
                      Submitting Request...
                    </span>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      Submit Custom Order Request
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400">
                  By submitting, you agree to our terms. We'll never share your information.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
