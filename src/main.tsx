import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Ensure cache and persistent auth/cart data are not retained in long-term storage across tab sessions
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('resin-auth-storage');
    localStorage.removeItem('resin-cart-storage');
    localStorage.removeItem('resin-wishlist-storage');
  } catch (_e) {
    // Ignore storage restrictions
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
