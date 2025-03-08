'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900">의료 분석 대시보드</span>
            </Link>
            <nav className="ml-6 flex space-x-4">
              <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100">
                대시보드
              </Link>
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-100">
                마케팅 홈으로
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-4">
              {user?.email || '사용자'}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 