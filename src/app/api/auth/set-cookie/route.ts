import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/server/cognito-server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: '토큰이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }
    
    // 토큰 검증 - 서버 측 유틸리티 사용
    const { valid } = await verifyToken(token);
    if (!valid) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }
    
    // 응답 객체 생성
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    
    // 쿠키 설정 (HttpOnly, Secure, SameSite=Strict)
    // HttpOnly: 자바스크립트에서 쿠키에 접근할 수 없도록 함
    // Secure: HTTPS 연결에서만 쿠키 전송 (개발 환경에서는 작동하지 않을 수 있음)
    // SameSite=Strict: CSRF 공격 방지를 위해 동일 사이트 요청에서만 쿠키 전송
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 프로덕션 환경에서만 Secure 설정
      sameSite: 'strict',
      path: '/',
      maxAge: 3600 // 1시간 유효
    });
    
    return response;
  } catch {
    return NextResponse.json(
      { error: '쿠키 설정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // 로그아웃 시 쿠키 삭제
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  );
  
  response.cookies.set({
    name: 'auth-token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0 // 즉시 만료
  });
  
  return response;
} 