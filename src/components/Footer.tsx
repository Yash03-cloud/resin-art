import { Link } from '@/lib/compat-router';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  HeartIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const footerLinks = {
  shop: [
    { name: 'All Products', path: '/shop' },
    { name: 'Wall Art', path: '/shop?category=Wall Art' },
    { name: 'Coasters', path: '/shop?category=Coasters' },
    { name: 'Jewellery', path: '/shop?category=Jewellery' },
    { name: 'Keychains', path: '/shop?category=Keychains' },
    { name: 'Custom Order', path: '/custom-order' },
  ],
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'Contact', path: '/contact' },
    { name: 'Blog', path: '/blog' },
  ],
  policies: [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Return Policy', path: '/returns' },
    { name: 'Shipping Policy', path: '/shipping' },
    { name: 'FAQ', path: '/faq' },
  ],
};

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/artvibe_by_charu?obrf=c3MwNmFrZzd3ZjY1',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    color: 'hover:text-pink-500',
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: 'hover:text-blue-500',
  },
  {
    name: 'Pinterest',
    href: 'https://pinterest.com',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
    color: 'hover:text-red-500',
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/917218700468',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
    color: 'hover:text-green-500',
  },
];

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 relative overflow-hidden pb-20 sm:pb-24 lg:pb-8">
      {/* Newsletter Section - Compact & Responsive */}
      <div className="bg-gradient-primary py-8 sm:py-12 px-4 sm:px-6">
        <div className="container-max text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SparklesIcon className="w-7 h-7 sm:w-9 sm:h-9 text-white/80 mx-auto mb-2.5" />
            <h2 className="font-playfair text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
              Join Our Creative Community
            </h2>
            <p className="text-purple-100 text-xs sm:text-sm mb-5 max-w-md mx-auto">
              Subscribe for exclusive bespoke offers, new handcrafted arrivals, and artisan previews.
            </p>
            <form className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2.5 sm:py-3 rounded-full bg-white/10 border border-white/30 text-white placeholder-purple-200 text-xs sm:text-sm focus:outline-none focus:border-white transition-colors font-poppins"
              />
              <button
                type="submit"
                className="px-6 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-full text-xs sm:text-sm transition-colors whitespace-nowrap shadow-md cursor-pointer"
              >
                Subscribe ✨
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Main Footer - Compact 2-column on mobile, 5-column on desktop */}
      <div className="container-max py-8 sm:py-14 px-4 sm:px-6" style={{paddingTop:"1%"}}>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
          {/* Brand - spans full 2 columns on mobile for prominence */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 sm:gap-3 mb-3.5 group">
              <div className="bg-white/95 preserve-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-md border border-white/20 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo.png"
                  alt="Artvibe by Charu"
                  className="h-9 sm:h-11 w-auto object-contain"
                />
              </div>
              <div>
                <span className="font-playfair font-bold text-lg sm:text-xl text-white block leading-tight">Artvibe</span>
                <span className="text-[10px] sm:text-xs text-amber-300 font-semibold tracking-widest uppercase">by Charu</span>
              </div>
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 max-w-sm">
              Handcrafted resin art pieces designed to elevate your living spaces with glass-like luster, UV resistance, and bespoke artisan pigments.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-xs sm:text-sm">
              <a
                href="tel:+917218700468"
                className="flex items-center gap-2.5 text-gray-300 hover:text-purple-300 transition-colors"
              >
                <PhoneIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>+91 7218700468</span>
              </a>
              <a
                href="mailto:admin@artvibe.in"
                className="flex items-center gap-2.5 text-gray-300 hover:text-purple-300 transition-colors"
              >
                <EnvelopeIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>admin@artvibe.in</span>
              </a>
              <a
                href="https://share.google/V4e838dfV83d4nC2z"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-gray-300 hover:text-purple-300 transition-colors"
              >
                <MapPinIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Wardha, Maharashtra, India (Open Maps 📍)</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 mt-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 transition-colors ${social.color}`}
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div className="col-span-1">
            <h4 className="font-semibold text-white mb-3 text-xs sm:text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-purple-400 transition-colors block py-0.5"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-span-1">
            <h4 className="font-semibold text-white mb-3 text-xs sm:text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-purple-400 transition-colors block py-0.5"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies & WhatsApp */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1">
            <h4 className="font-semibold text-white mb-3 text-xs sm:text-sm uppercase tracking-wider">Policies</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              {footerLinks.policies.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-purple-400 transition-colors block py-0.5"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Compact WhatsApp CTA */}
            <div className="mt-4 sm:mt-5">
              <a
                href="https://wa.me/917218700468?text=Hello! I'm interested in your resin art products."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-full transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span>WhatsApp Studio</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Compact & Clean */}
      <div className="border-t border-gray-900 bg-gray-950/80">
        <div className="container-max py-4 sm:py-5 px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-gray-400 text-center md:text-left">
            © {currentYear} Artvibe by Charu. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-gray-400">
            Made with <HeartIcon className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by Charu & Artvibe Team
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 text-emerald-300 border border-emerald-800/50 font-medium">
              💵 COD Available
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-950/70 text-purple-300 border border-purple-800/50 font-medium">
              🔒 Safe Delivery
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-900 text-gray-300 border border-gray-800 font-medium">
              📦 Doorstep Check
            </span>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/917218700468?text=Hello! I'm interested in your resin art products."
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 w-11 h-11 sm:w-13 sm:h-13 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      </motion.a>
    </footer>
  );
}
