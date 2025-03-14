import { NextRequest, NextResponse } from 'next/server';
import { cognitoServerService } from '@/lib/server/cognito-server';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    // 필수 필드 검증
    if (!email || !code) {
      return NextResponse.json(
        { message: '이메일과 인증 코드는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    // 서버 측에서 Cognito 이메일 인증 확인 수행
    await cognitoServerService.confirmSignUp(email, code);
    
    return NextResponse.json({
      success: true,
      message: '이메일 인증이 완료되었습니다. 로그인해주세요.'
    });
  } catch (error: unknown) {
    
    // 에러 메시지 처리
    let errorMessage = '이메일 인증 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    // 에러 객체에 code 속성이 있는지 확인
    if (error && typeof error === 'object' && 'code' in error) {
      const cognitoError = error as { code: string; message?: string };
      
      if (cognitoError.code === 'CodeMismatchException') {
        errorMessage = '인증 코드가 일치하지 않습니다.';
        statusCode = 400;
      } else if (cognitoError.code === 'ExpiredCodeException') {
        errorMessage = '인증 코드가 만료되었습니다.';
        statusCode = 400;
      } else if (cognitoError.code === 'UserNotFoundException') {
        errorMessage = '등록되지 않은 사용자입니다.';
        statusCode = 404;
      } else if (cognitoError.code === 'NotAuthorizedException') {
        errorMessage = '이미 인증된 사용자입니다.';
        statusCode = 400;
      }
      
      return NextResponse.json(
        { message: errorMessage, code: cognitoError.code },
        { status: statusCode }
      );
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: statusCode }
    );
  }
} 