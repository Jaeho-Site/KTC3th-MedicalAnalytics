import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 응답 객체 생성
    const response = NextResponse.json({
      success: true,
      message: '로그아웃 되었습니다.'
    });
    
    // 인증 쿠키 삭제
    response.cookies.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // 즉시 만료
      path: '/'
    });
    
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 