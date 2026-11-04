import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { submitContactMessage } from '../services/api';
import toast from 'react-hot-toast';

interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const contactInfo = [
  { icon: <PhoneIcon className="w-6 h-6" />, title: 'Phone', value: '+91 7218700468', link: 'tel:+917218700468' },
  { icon: <EnvelopeIcon className="w-6 h-6" />, title: 'Email', value: 'admin@artvibe.in', link: 'mailto:admin@artvibe.in' },
  { icon: <MapPinIcon className="w-6 h-6" />, title: 'Studio', value: 'wardha, Maharashtra, India', link: 'https://share.google/V4e838dfV83d4nC2z' },
  { icon: <ClockIcon className="w-6 h-6" />, title: 'Hours', value: 'Mon–Sat: 10AM – 7PM', link: '#' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    try {
      await submitContactMessage({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
      });
      setSubmitted(true);
      reset();
      toast.success("Message sent! We'll respond within 24 hours. 🎨");
    } catch {
      toast.error('Could not send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 pt-20">
      {/* Header */}
      <div className="bg-gradient-hero py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=1600" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative container-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-block bg-white/95 px-4 py-2 rounded-2xl shadow-xl mb-4">
              <img src="/logo.png" alt="Artvibe by Charu" className="h-12 w-auto object-contain mx-auto" />
            </div>
            <h1 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-4">Get In Touch</h1>
            <p className="text-purple-200 text-xl max-w-xl mx-auto">
              Have a question or want to commission a custom piece? We'd love to hear from you!
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-max py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-playfair text-3xl font-bold text-gray-900 dark:text-white mb-8">Let's Talk</h2>

              <div className="space-y-5 mb-10">
                {contactInfo.map((info) => (
                  <a
                    key={info.title}
                    href={info.link}
                    target={info.link.startsWith('http') ? '_blank' : undefined}
                    rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-transparent dark:border-gray-700/60 transition-colors group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 group-hover:bg-gradient-primary rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-300 group-hover:text-white transition-all shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{info.title}</p>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">{info.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Social Media */}
              <div className="mb-10">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    { name: 'Instagram', icon: '📸', href: 'https://www.instagram.com/artvibe_by_charu?obrf=c3MwNmFrZzd3ZjY1', color: 'hover:bg-pink-500' },
                    { name: 'Pinterest', icon: '📌', href: 'https://pinterest.com', color: 'hover:bg-red-500' },
                    { name: 'Facebook', icon: '👥', href: 'https://facebook.com', color: 'hover:bg-blue-500' },
                    { name: 'YouTube', icon: '▶️', href: 'https://youtube.com', color: 'hover:bg-red-600' },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 ${social.color} hover:text-white rounded-xl flex items-center justify-center text-xl transition-all hover:scale-110`}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Direct Artist Contact Card */}
              <div className="flex items-center gap-3.5 p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/60 mb-5">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400 shrink-0 shadow">
                  <img src="/charu.jpg" alt="Charu" className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Direct Line to Charu ✨</p>
                  <p className="text-gray-500 dark:text-gray-300 text-xs">Have questions or custom ideas? I personally reply to every inquiry.</p>
                </div>
              </div>

              {/* WhatsApp & Instagram Direct CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/917218700468?text=Hello! I have a question about your resin art."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-semibold transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  <span>Chat WhatsApp</span>
                </a>
                <a
                  href="https://www.instagram.com/artvibe_by_charu?obrf=c3MwNmFrZzd3ZjY1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all shadow-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>DM on Instagram</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-3">Message Sent! 🎨</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="btn-primary">
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <>
                  <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                        <input
                          {...register('name', { required: 'Name is required' })}
                          className="input-field"
                          placeholder="Your Full Name"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                        <input
                          {...register('phone')}
                          type="tel"
                          className="input-field"
                          placeholder="+91 7218700468"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' },
                        })}
                        type="email"
                        className="input-field"
                        placeholder="you@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject *</label>
                      <select
                        {...register('subject', { required: 'Please select a subject' })}
                        className="input-field"
                      >
                        <option value="">Select a subject...</option>
                        <option>Product Inquiry</option>
                        <option>Custom Order Request</option>
                        <option>Order Support</option>
                        <option>Collaboration</option>
                        <option>General Question</option>
                        <option>Other</option>
                      </select>
                      {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message *</label>
                      <textarea
                        {...register('message', {
                          required: 'Message is required',
                          minLength: { value: 20, message: 'Message must be at least 20 characters' },
                        })}
                        rows={5}
                        className="input-field resize-none"
                        placeholder="Tell us about your inquiry, custom order ideas, or any questions you have..."
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
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
                          Sending...
                        </span>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 rounded-3xl overflow-hidden shadow-lg"
            >
              <div className="bg-purple-50 dark:bg-gray-800 h-64 flex items-center justify-center border border-purple-100 dark:border-gray-700 rounded-3xl">
                <div className="text-center">
                  <div className="inline-block bg-white dark:bg-gray-700 p-2 rounded-2xl shadow-xs border border-purple-100 dark:border-gray-600 mb-3">
                    <img src="/logo.png" alt="Artvibe by Charu" className="h-10 w-auto object-contain mx-auto" />
                  </div>
                  <p className="text-gray-800 dark:text-gray-100 font-semibold text-base">Artvibe by Charu Studio</p>
                  <p className="text-gray-400 dark:text-gray-300 text-sm">wardha, Maharashtra, India</p>
                  <a
                    href="https://share.google/V4e838dfV83d4nC2z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-4 text-sm py-2 px-4 inline-flex items-center gap-1.5"
                  >
                    <span>Open in Google Maps 📍</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
