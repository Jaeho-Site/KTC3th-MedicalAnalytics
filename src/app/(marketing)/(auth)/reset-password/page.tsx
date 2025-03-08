'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/marketing/Button';
import { cognitoService,CognitoError } from '@/lib/cognito';
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
    <div className="max-w-md w-full mx-auto space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          비밀번호 재설정
        </h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
        {step === 'request' ? (
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
              disabled={loading}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                인증 코드
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                새 비밀번호
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                minLength={8}
              />
              <p className="mt-1 text-xs text-gray-500">
                8자 이상, 숫자와 특수문자를 포함해야 합니다.
              </p>
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          size="large" 
          className="w-full"
          disabled={loading}
        >
          {loading ? '처리 중...' : (step === 'request' ? '인증 코드 받기' : '비밀번호 변경')}
        </Button>
      </form>
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