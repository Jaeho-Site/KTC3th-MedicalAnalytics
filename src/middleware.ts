import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/server/cognito-server';

// 보호된 경로 정의
const protectedRoutes = ['/dashboard', '/profile', '/settings','/mypage'];
const authRoutes = ['/login', '/signup', '/verify-email', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 인증 토큰 확인 (HttpOnly 쿠키에서 읽기)
  const authToken = request.cookies.get('auth-token')?.value;
  
  // 인증되지 않은 사용자가 보호된 경로에 접근하는 경우 로그인 페이지로 리디렉션
  if (!authToken && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 보호된 경로에 접근할 때 토큰 검증 수행
  if (authToken && protectedRoutes.some(route => pathname.startsWith(route))) {
    // 토큰 검증 - 서버 측 유틸리티 사용
    const { valid } = await verifyToken(authToken);
    if (!valid) {
      // 토큰이 유효하지 않으면 로그인 페이지로 리디렉션
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // 인증된 사용자가 인증 페이지에 접근하는 경우 대시보드로 리디렉션
  if (authToken && authRoutes.some(route => pathname.startsWith(route))) {
    // 토큰 검증 - 서버 측 유틸리티 사용
    const { valid } = await verifyToken(authToken);
    if (valid) {
      // 토큰이 유효하면 대시보드로 리디렉션
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/mypage/:path*',
    '/login',
    '/signup',
    '/verify-email',
    '/reset-password',
  ],
}; 