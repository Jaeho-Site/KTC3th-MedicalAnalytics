'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/marketing/Button';
import Link from 'next/link';
import { CognitoError } from '@/lib/cognito';
import { useAuth } from '@/contexts/AuthContext';

const SignUpContent = () => {
  const router = useRouter();
  const { signup, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 에러 초기화
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signup(formData.email, formData.password);
      // 비밀번호는 컨텍스트에 저장되므로 URL에 포함하지 않음
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      setError(cognitoError.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          회원가입
        </h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
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
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
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
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">
              8자 이상, 숫자와 특수문자를 포함해야 합니다.
            </p>
          </div>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          size="large" 
          className="w-full"
          disabled={loading}
        >
          {loading ? '처리 중...' : '회원가입'}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">이미 계정이 있으신가요? </span>
          <Link href="/login" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
            로그인
          </Link>
        </div>
      </form>
    </div>
  );
};

const SignUpForm = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
};

export default SignUpForm;