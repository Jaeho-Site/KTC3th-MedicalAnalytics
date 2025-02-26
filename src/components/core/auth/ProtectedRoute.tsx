'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cognitoService } from '@/lib/cognito';
import { create } from 'zustand';

// Zustand store for auth state
interface AuthStore {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
}));

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await cognitoService.getCurrentSession();
        if (!session) {
          router.push('/login');
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, setIsAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}