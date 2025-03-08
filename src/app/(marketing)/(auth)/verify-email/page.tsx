'use client';

import { Suspense, useEffect } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/marketing/Button';
import { cognitoService, CognitoError } from '@/lib/cognito';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const VerifyEmailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { verifyEmail, tempEmail, tempPassword, clearError } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 에러 초기화
  useEffect(() => {
    clearError();
  }, [clearError]);

  // URL에서 이메일이 없으면 컨텍스트에서 가져오기
  const emailToUse = email || tempEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToUse) {
      setError('이메일 정보가 없습니다.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await verifyEmail(emailToUse, code);
      // verifyEmail 함수 내에서 자동 로그인 시도
      router.push('/dashboard');
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      setError(cognitoError.message || '인증 코드 확인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            이메일 인증
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            이메일로 전송된 인증 코드를 입력해주세요.
          </p>
          {emailToUse && (
            <p className="mt-1 text-center text-sm font-medium text-gray-800">
              {emailToUse}
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              인증 코드
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="인증 코드 6자리"
            />
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full"
              disabled={loading}
            >
              {loading ? '인증 중...' : '인증 확인'}
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <p className="text-gray-600">
              인증 코드를 받지 못하셨나요?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                로그인으로 돌아가기
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

const VerifyEmailForm = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmailForm;