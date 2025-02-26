'use client';

import ProtectedRoute from '@/components/core/auth/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        {/* 대시보드 컨텐츠 */}
      </div>
    </ProtectedRoute>
  );
}
