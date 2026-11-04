import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CustomOrderPage from './pages/CustomOrderPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import WishlistPage from './pages/WishlistPage';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import { useAuthStore } from './store/authStore';

// Automatically scroll to top on page navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

// User-friendly animated Scroll to Top floating action button
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

// Page wrapper with smooth entrance animation
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

// Layout with Navbar + Footer + Scroll Top button
const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
    <ScrollTopButton />
  </>
);

// Admin Route Guard
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAuthStore();
  return isAdmin ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout><PageWrapper><HomePage /></PageWrapper></Layout>} />
        <Route path="/shop" element={<Layout><PageWrapper><ShopPage /></PageWrapper></Layout>} />
        <Route path="/product/:id" element={<Layout><PageWrapper><ProductDetailPage /></PageWrapper></Layout>} />
        <Route path="/cart" element={<Layout><PageWrapper><CartPage /></PageWrapper></Layout>} />
        <Route path="/checkout" element={<Layout><PageWrapper><CheckoutPage /></PageWrapper></Layout>} />
        <Route path="/gallery" element={<Layout><PageWrapper><GalleryPage /></PageWrapper></Layout>} />
        <Route path="/about" element={<Layout><PageWrapper><AboutPage /></PageWrapper></Layout>} />
        <Route path="/contact" element={<Layout><PageWrapper><ContactPage /></PageWrapper></Layout>} />
        <Route path="/custom-order" element={<Layout><PageWrapper><CustomOrderPage /></PageWrapper></Layout>} />
        <Route path="/track-order" element={<Layout><PageWrapper><OrderTrackingPage /></PageWrapper></Layout>} />
        <Route path="/wishlist" element={<Layout><PageWrapper><WishlistPage /></PageWrapper></Layout>} />
        <Route path="/dashboard" element={<Layout><PageWrapper><CustomerDashboardPage /></PageWrapper></Layout>} />
        <Route path="/orders" element={<Layout><PageWrapper><CustomerDashboardPage /></PageWrapper></Layout>} />

        {/* Auth Routes (no Navbar/Footer) */}
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />

        {/* Admin Routes (no public Navbar/Footer) */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={
          <Layout>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
              <div className="text-center">
                <div className="text-8xl font-bold text-gradient font-playfair mb-4">404</div>
                <h2 className="font-playfair text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
                <a href="/" className="btn-primary">Go Home ✨</a>
              </div>
            </div>
          </Layout>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Poppins, sans-serif',
            borderRadius: '12px',
            border: '1px solid #F3F4F6',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#6B46C1', secondary: 'white' },
          },
        }}
      />
    </BrowserRouter>
  );
}
