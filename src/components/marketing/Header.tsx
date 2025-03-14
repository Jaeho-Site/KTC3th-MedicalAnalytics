'use client';

import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50 dark:bg-gray-900/80">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
            MediScan
          </Link>
          <div className="flex items-center space-x-8">
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/about" 
                className="text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-500 transition-colors"
              >
                소개
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-500 transition-colors"
              >
                요금제
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-500 transition-colors"
                  >
                    대시보드
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-500 transition-colors"
                  >
                    로그인
                  </Link>
                  <Link 
                    href="/signup" 
                    className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
