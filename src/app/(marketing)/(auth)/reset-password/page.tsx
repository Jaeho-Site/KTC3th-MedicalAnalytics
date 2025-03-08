'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/marketing/Button';
import Link from 'next/link';
import { CognitoError } from '@/lib/cognito';
import { useAuth } from '@/contexts/AuthContext';

const ResetPasswordContent = () => {
  const router = useRouter();
  const { resetPassword, confirmResetPassword, tempEmail, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 에러 초기화
  useEffect(() => {
    clearError();
    
    // 컨텍스트에 저장된 이메일이 있으면 사용
    if (tempEmail) {
      setEmail(tempEmail);
    }
  }, [clearError, tempEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (step === 'request') {
        await resetPassword(email);
        setStep('verify');
      } else {
        await confirmResetPassword(email, code, newPassword);
        router.push('/login');
      }
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('Reset Password Error:', cognitoError);
      setError(cognitoError.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            비밀번호 재설정
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'request' 
              ? '가입한 이메일 주소를 입력해주세요.' 
              : '이메일로 전송된 인증 코드와 새 비밀번호를 입력해주세요.'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          {step === 'request' ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
              />
            </div>
          ) : (
            <>
              <div className="mb-4">
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
                  placeholder="인증 코드"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="새 비밀번호 (8자 이상, 숫자와 특수문자 포함)"
                />
              </div>
            </>
          )}

          <div>
            <Button
              type="submit"
              className="group relative w-full"
              disabled={loading}
            >
              {loading 
                ? '처리 중...' 
                : (step === 'request' ? '인증 코드 요청' : '비밀번호 변경')}
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <p className="text-gray-600">
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

const ResetPasswordForm = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordForm;