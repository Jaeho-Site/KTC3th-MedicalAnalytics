'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthError, User, SignUpResult } from '@/lib/auth-types';

// 안전한 로깅을 위한 유틸리티 함수
const safeLogError = (message: string, error?: Error | unknown) => {
  // 기본 오류 메시지는 항상 로깅
  console.error(message);
  
  // 개발 환경에서만 추가 정보 로깅
  if (process.env.NODE_ENV === 'development') {
    // 오류 코드와 메시지만 로깅하고 전체 객체는 로깅하지 않음
    if (error) {
      const safeErrorInfo = {
        code: error instanceof Error ? 
          // AuthError와 같은 확장된 Error 객체의 code 속성에 접근
          ('code' in error ? (error as { code: string }).code : 'UNKNOWN_ERROR') : 
          'UNKNOWN_ERROR',
        name: error instanceof Error ? error.name : typeof error,
        message: error instanceof Error ? error.message : String(error)
      };
      console.error('개발 환경 상세 오류:', safeErrorInfo);
    }
  }
};

// JWT 디코딩 함수 (jwt-decode 라이브러리 대체)
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    safeLogError('JWT 디코딩 오류');
    return null;
  }
}

// 인증 컨텍스트에서 관리할 상태와 함수들의 타입 정의
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  tempEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<SignUpResult>;
  logout: () => void;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  setTempEmail: (email: string) => void;
  clearTempEmail: () => void;
  clearError: () => void;
  getAuthToken: () => Promise<string | null>;
}

// 기본값으로 초기화된 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
  tempEmail: null,
  login: async () => {},
  signup: async () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Signup not implemented in default context');
    }
    return {} as SignUpResult;
  },
  logout: () => {},
  verifyEmail: async () => {},
  resetPassword: async () => {},
  confirmResetPassword: async () => {},
  setTempEmail: () => {},
  clearTempEmail: () => {},
  clearError: () => {},
  getAuthToken: async () => null,
});

// 컨텍스트 프로바이더 컴포넌트
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tempEmail, setTempEmail] = useState<string | null>(null);

  // 초기 인증 상태 확인
  const checkAuthStatus = useCallback(async () => {
    try {
      // 서버 API를 통해 세션 확인
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include', // 쿠키를 포함하기 위해 필요
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // 인증되지 않은 상태
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }
        throw new Error('세션 확인 중 오류가 발생했습니다.');
      }
      
      const data = await response.json();
      
      if (data.isAuthenticated) {
        setIsAuthenticated(true);
        setUser({
          email: data.user.email,
          username: data.user.email.split('@')[0],
          attributes: {
            sub: data.user.sub,
            email: data.user.email
          }
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        // 프로덕션에서는 오류 코드만 로깅
        console.error('인증 상태 확인 오류', err instanceof Error ? err.name : 'Unknown error');
      } else {
        // 개발 환경에서는 더 자세한 정보 로깅
        safeLogError('인증 상태 확인 오류', err);
      }
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      // 서버 API를 통해 로그아웃
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include', // 쿠키를 포함하기 위해 필요
      });
      
      // 인증 토큰 쿠키 삭제
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('인증 토큰 쿠키가 삭제되었습니다.');
      }
      
      setIsAuthenticated(false);
      setUser(null);
      
      // 인증 상태 변경 이벤트 발생
      window.dispatchEvent(new Event('auth-change'));
    } catch (error) {
      safeLogError('로그아웃 오류', error);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();

    // 인증 상태 변경 이벤트 리스너
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    // 토큰 갱신 필요 이벤트 리스너
    const handleTokenRefreshNeeded = () => {
      // 로그아웃 처리
      logout();
      // 사용자에게 알림
      setError('인증이 만료되었습니다. 다시 로그인해주세요.');
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('token-refresh-needed', handleTokenRefreshNeeded);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('token-refresh-needed', handleTokenRefreshNeeded);
    };
  }, [checkAuthStatus, logout]);

  // 인증 토큰 가져오기 함수 (클라이언트에서는 사용하지 않음)
  const getAuthToken = async (): Promise<string | null> => {
    return null; // 클라이언트에서는 토큰에 직접 접근하지 않음
  };

  // 로그인 함수
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 입력 값 검증
      if (!email || !password) {
        throw new Error('이메일과 비밀번호를 입력해주세요.');
      }
      
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('유효한 이메일 주소를 입력해주세요.');
      }
      
      // 서버 API를 통해 로그인
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // 쿠키를 포함하기 위해 필요
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401 && errorData.code === 'UserNotConfirmedException') {
          // 이메일 미인증 사용자는 임시 이메일만 저장
          setTempEmail(email);
          throw Object.assign(new Error(errorData.message), { code: errorData.code });
        }
        
        throw new Error(errorData.message || '로그인 중 오류가 발생했습니다.');
      }
      
      const data = await response.json();
      
      // 토큰이 응답에 포함되어 있으면 쿠키에 저장
      if (data.token) {
        // 클라이언트 측에서 쿠키 설정 (개발 환경에서만 로깅)
        if (process.env.NODE_ENV === 'development') {
          console.log('인증 토큰을 쿠키에 저장합니다.');
        }
        
        // 쿠키 만료 시간 설정 (예: 1일)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 1);
        
        // 쿠키 설정
        document.cookie = `authToken=${data.token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('쿠키 설정 완료:', document.cookie);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('응답에 토큰이 포함되어 있지 않습니다:', data);
        }
      }
      
      setIsAuthenticated(true);
      
      // 사용자 정보 설정
      setUser({
        email: email,
        username: email.split('@')[0] // 기본 사용자명으로 이메일 아이디 부분 사용
      });
      
      // 인증 상태 변경 이벤트 발생
      window.dispatchEvent(new Event('auth-change'));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('로그인 성공, 사용자 정보 설정');
      }
    } catch (err: unknown) {
      const authError = err as AuthError;
      safeLogError('로그인 오류', authError);
      
      if (authError.code === 'UserNotConfirmedException') {
        // 이메일 미인증 사용자는 임시 이메일만 저장
        setTempEmail(email);
        throw authError; // 상위 컴포넌트에서 처리할 수 있도록 에러 전파
      }
      
      setError(authError.message || '로그인 중 오류가 발생했습니다.');
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 함수
  const signup = async (email: string, password: string): Promise<SignUpResult> => {
    setIsLoading(true);
    setError(null);
    try {
      // 입력 값 검증
      if (!email || !password) {
        throw new Error('이메일과 비밀번호를 입력해주세요.');
      }
      
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('유효한 이메일 주소를 입력해주세요.');
      }
      
      // 비밀번호 강도 검증
      if (password.length < 8) {
        throw new Error('비밀번호는 8자 이상이어야 합니다.');
      }
      
      // 서버 API를 통해 회원가입
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw Object.assign(new Error(errorData.message), { code: errorData.code });
      }
      
      const data = await response.json();
      
      // 임시 이메일만 저장
      setTempEmail(email);
      
      return {
        user: { username: email },
        userConfirmed: data.userConfirmed,
        userSub: data.userSub,
      } as SignUpResult;
    } catch (err: unknown) {
      const authError = err as AuthError;
      safeLogError('회원가입 오류', authError);
      
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      
      if (authError.message) {
        errorMessage = authError.message;
      } else {
        switch (authError.code) {
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
      }
      
      setError(errorMessage);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 인증 함수
  const verifyEmail = async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 입력 값 검증
      if (!email || !code) {
        throw new Error('이메일과 인증 코드를 입력해주세요.');
      }
      
      // 서버 API를 통해 이메일 인증
      const response = await fetch('/api/auth/confirm-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw Object.assign(new Error(errorData.message), { code: errorData.code });
      }
      
      // 자동 로그인 시도 대신 인증 성공 메시지만 반환
      // 사용자는 로그인 페이지로 리디렉션됨
      clearTempEmail();
    } catch (err: unknown) {
      const authError = err as AuthError;
      safeLogError('이메일 인증 오류', authError);
      setError(authError.message || '인증 코드 확인에 실패했습니다.');
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 재설정 요청 함수
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 입력 값 검증
      if (!email) {
        throw new Error('이메일을 입력해주세요.');
      }
      
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('유효한 이메일 주소를 입력해주세요.');
      }
      
      // 서버 API를 통해 비밀번호 재설정 요청
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw Object.assign(new Error(errorData.message), { code: errorData.code });
      }
      
      setTempEmail(email);
    } catch (err: unknown) {
      const authError = err as AuthError;
      safeLogError('비밀번호 재설정 요청 오류', authError);
      setError(authError.message || '비밀번호 재설정 요청 중 오류가 발생했습니다.');
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 재설정 확인 함수
  const confirmResetPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 입력 값 검증
      if (!email || !code || !newPassword) {
        throw new Error('이메일, 인증 코드, 새 비밀번호를 모두 입력해주세요.');
      }
      
      // 비밀번호 강도 검증
      if (newPassword.length < 8) {
        throw new Error('비밀번호는 8자 이상이어야 합니다.');
      }
      
      // 서버 API를 통해 비밀번호 재설정 확인
      const response = await fetch('/api/auth/confirm-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw Object.assign(new Error(errorData.message), { code: errorData.code });
      }
      
      setTempEmail(null);
    } catch (err: unknown) {
      const authError = err as AuthError;
      safeLogError('비밀번호 변경 오류', authError);
      setError(authError.message || '비밀번호 변경 중 오류가 발생했습니다.');
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  // 임시 이메일 삭제 함수
  const clearTempEmail = () => {
    setTempEmail(null);
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
    login,
    signup,
    logout,
    verifyEmail,
    resetPassword,
    confirmResetPassword,
    setTempEmail,
    clearTempEmail,
    clearError,
    getAuthToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 커스텀 훅으로 컨텍스트 사용 간소화
export const useAuth = () => useContext(AuthContext);