'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cognitoService, CognitoError } from '@/lib/cognito';

// 인증 컨텍스트에서 관리할 상태와 함수들의 타입 정의
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  error: string | null;
  tempEmail: string | null;
  tempPassword: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => void;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  setTempCredentials: (email: string, password: string) => void;
  clearTempCredentials: () => void;
  clearError: () => void;
}

// 기본값으로 초기화된 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
  tempEmail: null,
  tempPassword: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  verifyEmail: async () => {},
  resetPassword: async () => {},
  confirmResetPassword: async () => {},
  setTempCredentials: () => {},
  clearTempCredentials: () => {},
  clearError: () => {},
});

// 컨텍스트 프로바이더 컴포넌트
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tempEmail, setTempEmail] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  // 초기 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const session = await cognitoService.getCurrentSession();
        if (session) {
          setIsAuthenticated(true);
          // 사용자 정보 가져오기 로직 추가 가능
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // 인증 상태 변경 이벤트 리스너
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  // 로그인 함수
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await cognitoService.signIn(email, password);
      setIsAuthenticated(true);
      // 사용자 정보 가져오기 로직 추가 가능
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('Login Error:', cognitoError);
      
      if (cognitoError.code === 'UserNotConfirmedException') {
        // 이메일 미인증 사용자는 임시 자격증명 저장
        setTempCredentials(email, password);
        throw cognitoError; // 상위 컴포넌트에서 처리할 수 있도록 에러 전파
      }
      
      setError(cognitoError.message || '로그인 중 오류가 발생했습니다.');
      throw cognitoError;
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 함수
  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await cognitoService.signUp(email, password);
      // 임시 자격증명 저장
      setTempCredentials(email, password);
      return result;
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('SignUp Error:', cognitoError);
      
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
      
      setError(errorMessage);
      throw cognitoError;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    cognitoService.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  // 이메일 인증 함수
  const verifyEmail = async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await cognitoService.confirmSignUp(email, code);
      
      // 저장된 임시 비밀번호가 있으면 자동 로그인 시도
      if (tempEmail === email && tempPassword) {
        try {
          await login(email, tempPassword);
          clearTempCredentials();
        } catch (signInErr) {
          console.error('Auto sign-in failed after verification:', signInErr);
          // 자동 로그인 실패해도 인증은 성공했으므로 에러 무시
        }
      }
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('Verification Error:', cognitoError);
      setError(cognitoError.message || '인증 코드 확인에 실패했습니다.');
      throw cognitoError;
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 재설정 요청 함수
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await cognitoService.forgotPassword(email);
      setTempEmail(email);
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('Reset Password Error:', cognitoError);
      setError(cognitoError.message || '비밀번호 재설정 요청 중 오류가 발생했습니다.');
      throw cognitoError;
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 재설정 확인 함수
  const confirmResetPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await cognitoService.confirmPassword(email, code, newPassword);
      setTempEmail(null);
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('Confirm Reset Password Error:', cognitoError);
      setError(cognitoError.message || '비밀번호 변경 중 오류가 발생했습니다.');
      throw cognitoError;
    } finally {
      setIsLoading(false);
    }
  };

  // 임시 자격증명 저장 함수
  const setTempCredentials = (email: string, password: string) => {
    setTempEmail(email);
    setTempPassword(password);
  };

  // 임시 자격증명 삭제 함수
  const clearTempCredentials = () => {
    setTempEmail(null);
    setTempPassword(null);
  };

  // 에러 메시지 초기화
  const clearError = () => {
    setError(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    error,
    tempEmail,
    tempPassword,
    login,
    signup,
    logout,
    verifyEmail,
    resetPassword,
    confirmResetPassword,
    setTempCredentials,
    clearTempCredentials,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 커스텀 훅으로 컨텍스트 사용 간소화
export const useAuth = () => useContext(AuthContext); 