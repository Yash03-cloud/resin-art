'use client';

import { Suspense } from 'react';
import ShopPage from '@/views/ShopPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 text-center text-purple-600 font-medium">
          Loading collection...
        </div>
      }
    >
      <ShopPage />
    </Suspense>
  );
}
