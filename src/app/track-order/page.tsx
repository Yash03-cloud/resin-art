'use client';

import { Suspense } from 'react';
import OrderTrackingPage from '@/views/OrderTrackingPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 text-center text-purple-600 font-medium">
          Loading tracker...
        </div>
      }
    >
      <OrderTrackingPage />
    </Suspense>
  );
}
