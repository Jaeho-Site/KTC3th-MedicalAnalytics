'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { cognitoService, CognitoError } from '@/lib/cognito';
import { ISignUpResult } from 'amazon-cognito-identity-js';

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
    console.error('JWT 디코딩 오류');
    return null;
  }
}

// 토큰 만료 검증 함수
function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    console.error('토큰 만료 검증 오류');
    return true;
  }
}

// any 타입을 더 구체적인 타입으로 변경
interface User {
  email?: string;
  username?: string;
  attributes?: Record<string, string>;
}

// 인증 컨텍스트에서 관리할 상태와 함수들의 타입 정의
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  tempEmail: string | null;
  tempPassword: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<ISignUpResult>;
  logout: () => void;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  setTempCredentials: (email: string, password: string) => void;
  clearTempCredentials: () => void;
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
  tempPassword: null,
  login: async () => {},
  signup: async () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Signup not implemented in default context');
    }
    return {} as ISignUpResult;
  },
  logout: () => {},
  verifyEmail: async () => {},
  resetPassword: async () => {},
  confirmResetPassword: async () => {},
  setTempCredentials: () => {},
  clearTempCredentials: () => {},
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
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  // 초기 인증 상태 확인
  const checkAuthStatus = useCallback(async () => {
    try {
      const session = await cognitoService.getCurrentSession();
      if (session) {
        // 토큰 만료 검증
        const idToken = session.getIdToken().getJwtToken();
        if (isTokenExpired(idToken)) {
          console.log('토큰이 만료되었습니다. 다시 로그인이 필요합니다.');
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        setIsAuthenticated(true);
        
        // 세션에서 사용자 정보 추출
        try {
          const payload = decodeJwt(idToken);
          if (payload && payload.email) {
            // 사용자 정보 설정
            setUser({
              email: payload.email,
              username: payload.email.split('@')[0],
              attributes: {
                sub: payload.sub,
                email: payload.email
              }
            });
            
            if (process.env.NODE_ENV === 'development') {
              console.log('세션에서 사용자 정보를 가져왔습니다');
            }
          } else {
            console.error('토큰에서 이메일을 찾을 수 없습니다');
          }
        } catch {
          console.error('토큰에서 사용자 정보 추출 실패');
          if (process.env.NODE_ENV === 'development') {
            console.error('상세 오류:');
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('인증 상태 확인 오류');
      if (process.env.NODE_ENV === 'development') {
        console.error('상세 오류:', err);
      }
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();

    // 인증 상태 변경 이벤트 리스너
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [checkAuthStatus]);

  // 인증 토큰 가져오기 함수
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const session = await cognitoService.getCurrentSession();
      if (session) {
        const idToken = session.getIdToken().getJwtToken();
        if (isTokenExpired(idToken)) {
          console.log('토큰이 만료되었습니다. 다시 로그인이 필요합니다.');
          return null;
        }
        return idToken;
      }
      return null;
    } catch {
      console.error('인증 토큰 가져오기 오류');
      return null;
    }
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
      
      await cognitoService.signIn(email, password);
      setIsAuthenticated(true);
      
      // 사용자 정보 설정
      setUser({
        email: email,
        username: email.split('@')[0] // 기본 사용자명으로 이메일 아이디 부분 사용
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('로그인 성공, 사용자 정보 설정');
      }
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('로그인 오류');
      if (process.env.NODE_ENV === 'development') {
        console.error('상세 오류:', cognitoError);
      }
      
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
  const signup = async (email: string, password: string): Promise<ISignUpResult> => {
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
      
      const result = await cognitoService.signUp(email, password);
      // 임시 자격증명 저장
      setTempCredentials(email, password);
      return result;
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('회원가입 오류');
      if (process.env.NODE_ENV === 'development') {
        console.error('상세 오류:', cognitoError);
      }
      
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
      // 입력 값 검증
      if (!email || !code) {
        throw new Error('이메일과 인증 코드를 입력해주세요.');
      }
      
      await cognitoService.confirmSignUp(email, code);
      
      // 저장된 임시 비밀번호가 있으면 자동 로그인 시도
      if (tempEmail === email && tempPassword) {
        try {
          await login(email, tempPassword);
          clearTempCredentials();
        } catch (signInErr) {
          console.error('인증 후 자동 로그인 실패');
          if (process.env.NODE_ENV === 'development') {
            console.error('상세 오류:', signInErr);
          }
          // 자동 로그인 실패해도 인증은 성공했으므로 에러 무시
        }
      }
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('이메일 인증 오류');
      if (process.env.NODE_ENV === 'development') {
        console.error('상세 오류:', cognitoError);
      }
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
      // 입력 값 검증
      if (!email) {
        throw new Error('이메일을 입력해주세요.');
      }
      
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('유효한 이메일 주소를 입력해주세요.');
      }
      
      await cognitoService.forgotPassword(email);
      setTempEmail(email);
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('비밀번호 재설정 요청 오류');
      if (process.env.NODE_ENV === 'development') {
        console.error('상세 오류:', cognitoError);
      }
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
      // 입력 값 검증
      if (!email || !code || !newPassword) {
        throw new Error('이메일, 인증 코드, 새 비밀번호를 모두 입력해주세요.');
      }
      
      // 비밀번호 강도 검증
      if (newPassword.length < 8) {
        throw new Error('비밀번호는 8자 이상이어야 합니다.');
      }
      
      await cognitoService.confirmPassword(email, code, newPassword);
      setTempEmail(null);
    } catch (err: unknown) {
      const cognitoError = err as CognitoError;
      console.error('비밀번호 변경 오류');
      if (process.env.NODE_ENV === 'development') {
        console.error('상세 오류:', cognitoError);
      }
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
    getAuthToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 커스텀 훅으로 컨텍스트 사용 간소화
export const useAuth = () => useContext(AuthContext); 