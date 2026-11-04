'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/views/AdminDashboard';
import { useAuthStore } from '@/store/authStore';

export default function Page() {
  const { isAdmin } = useAuthStore();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/login');
    } else {
      setChecking(false);
    }
  }, [isAdmin, router]);

  if (checking || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">Verifying studio administrator session...</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
