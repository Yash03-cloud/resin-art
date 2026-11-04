'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import Navbar from './Navbar';
import Footer from './Footer';

function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-20 lg:bottom-6 left-4 sm:left-6 z-40 p-3 sm:p-3.5 rounded-full bg-purple-600/90 hover:bg-purple-600 text-white shadow-xl backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <ArrowUpIcon className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password';

  const isAdminPage = pathname.startsWith('/admin');

  const hidePublicChrome = isAuthPage || isAdminPage;

  // Scroll to top on pathname change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  if (hidePublicChrome) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ScrollTopButton />
    </>
  );
}

