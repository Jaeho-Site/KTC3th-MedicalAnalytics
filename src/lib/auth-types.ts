// 인증 관련 타입 정의

// 에러 타입 정의
export interface AuthError extends Error {
  code?: string;
  statusCode?: number;
}

// 사용자 타입 정의
export interface User {
  email?: string;
  username?: string;
  attributes?: Record<string, string>;
}

// 회원가입 결과 타입 정의
export interface SignUpResult {
  user: {
    username: string;
  };
  userConfirmed: boolean;
  userSub: string;
}

// 로그인 응답 타입 정의
export interface SignInResponse {
  success: boolean;
  user: {
    email: string;
    isAuthenticated: boolean;
  };
}

// 세션 응답 타입 정의
export interface SessionResponse {
  isAuthenticated: boolean;
  user?: {
    email: string;
    sub: string;
  };
  message?: string;
}

// 이메일 인증 응답 타입 정의
export interface ConfirmSignUpResponse {
  success: boolean;
  message: string;
}

// 비밀번호 재설정 요청 응답 타입 정의
export interface ForgotPasswordResponse {
  success: boolean;
  destination?: string;
  message: string;
}

// 비밀번호 재설정 확인 응답 타입 정의
export interface ConfirmPasswordResponse {
  success: boolean;
  message: string;
} 