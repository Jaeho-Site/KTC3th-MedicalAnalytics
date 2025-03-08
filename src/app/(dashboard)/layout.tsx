import ProtectedRoute from '@/components/core/auth/ProtectedRoute';
import DashboardHeader from '@/components/dashboard/Header';

export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
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

