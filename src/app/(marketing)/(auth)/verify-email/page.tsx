'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/marketing/Button';
import { cognitoService, CognitoError } from '@/lib/cognito';

const VerifyEmailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const password = searchParams.get('password');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError('');

    try {
      console.log('Verifying email with code:', code);
      await cognitoService.confirmSignUp(email, code);
      console.log('Email verification successful');
      
      // 인증 성공 후 저장된 비밀번호로 자동 로그인
      try {
        await cognitoService.signIn(email, password);
        console.log('Auto sign-in successful');
        router.push('/dashboard');
      } catch (signInErr: unknown) {
        const cognitoError = signInErr as CognitoError;
        console.error('Auto sign-in failed:', cognitoError);
        router.push('/login');
      }
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('Verification Error:', cognitoError);
      setError(cognitoError.message || '인증 코드 확인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          이메일 인증
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          이메일로 전송된 인증 코드를 입력해주세요.
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
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

        <Button 
          type="submit" 
          variant="primary" 
          size="large" 
          className="w-full"
          disabled={loading}
        >
          {loading ? '처리 중...' : '인증하기'}
        </Button>
      </form>
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