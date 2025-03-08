'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cognitoService, CognitoError } from '@/lib/cognito';
import Button from '@/components/marketing/Button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const LoginContent = () => {
  const router = useRouter();
  const { login, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 에러 초기화
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      console.log('Login successful');
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      if (cognitoError.code === 'UserNotConfirmedException') {
        // 이메일 미인증 사용자는 인증 페이지로 리다이렉트 (비밀번호는 컨텍스트에 저장됨)
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(cognitoError.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          로그인
        </h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}
        <div className="space-y-4 rounded-md shadow-sm">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link href="/reset-password" className="text-blue-600 hover:text-blue-500">
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          size="large" 
          className="w-full"
          disabled={loading}
        >
          {loading ? '로그인 중...' : '로그인'}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">계정이 없으신가요? </span>
          <Link href="/signup" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
            회원가입
          </Link>
        </div>
      </form>
    </div>
  );
};

const LoginForm = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
};

export default LoginForm;