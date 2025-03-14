import { NextRequest, NextResponse } from 'next/server';
import { cognitoServerService } from '@/lib/server/cognito-server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 필수 필드 검증
    if (!email || !password) {
      return NextResponse.json(
        { message: '이메일과 비밀번호는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    // 서버 측에서 Cognito 인증 수행
    const result = await cognitoServerService.signIn(email, password);
    
    // 토큰 추출
    const idToken = result.getIdToken().getJwtToken();
    
    // 응답 객체 생성
    const response = NextResponse.json({
      success: true,
      user: {
        email,
        isAuthenticated: true
      }
    });
    
    // 응답 객체에 쿠키 설정
    response.cookies.set({
      name: 'auth-token',
      value: idToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24시간
      path: '/'
    });
    
    return response;
  } catch (error: any) {    
    // 에러 메시지 처리
    let errorMessage = '로그인 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error.code === 'UserNotConfirmedException') {
      errorMessage = '이메일 인증이 필요합니다.';
      statusCode = 401;
    } else if (error.code === 'NotAuthorizedException') {
      errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      statusCode = 401;
    } else if (error.code === 'UserNotFoundException') {
      errorMessage = '등록되지 않은 사용자입니다.';
      statusCode = 404;
    }
    
    return NextResponse.json(
      { message: errorMessage, code: error.code },
      { status: statusCode }
    );
  }
} 