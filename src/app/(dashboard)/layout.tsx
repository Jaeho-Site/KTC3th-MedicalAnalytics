import ProtectedRoute from '@/components/core/auth/ProtectedRoute';
import DashboardHeader from '@/components/dashboard/Header';

export const metadata = {
  title: 'Mediscan',
  description: '약물 이미지 분석 서비스',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

