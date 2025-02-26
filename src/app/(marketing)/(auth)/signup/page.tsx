'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/marketing/Button';
import Link from 'next/link';
import { cognitoService, CognitoError } from '@/lib/cognito';

const SignUpContent = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    console.log('Form Submission:', { 
      email: formData.email,
      passwordLength: formData.password.length 
    });

    try {
      console.log('Calling cognitoService.signUp...');
      const signUpResult = await cognitoService.signUp(
        formData.email,
        formData.password
      );
      
      console.log('SignUp Success:', signUpResult);
      
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}`);
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('SignUp Error Details:', { 
        code: cognitoError.code,
        message: cognitoError.message,
        name: cognitoError.name
      });

      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      
      switch (cognitoError.code) {
        case 'UsernameExistsException':
          errorMessage = '이미 등록된 이메일 주소입니다.';
          break;
        case 'InvalidPasswordException':
          errorMessage = '비밀번호는 8자 이상이어야 하며, 숫자와 특수문자를 포함해야 합니다.';
          break;
        case 'InvalidParameterException':
          errorMessage = '입력한 정보가 올바르지 않습니다.';
          break;
      }
      
      console.log('Setting Error Message:', errorMessage);
      setError(errorMessage);
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