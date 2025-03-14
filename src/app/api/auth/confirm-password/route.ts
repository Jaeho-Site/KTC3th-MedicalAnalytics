import { NextRequest, NextResponse } from 'next/server';
import { cognitoServerService } from '@/lib/server/cognito-server';

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    // 필수 필드 검증
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { message: '이메일, 인증 코드, 새 비밀번호는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 강도 검증 (서버 측에서도 검증)
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: '비밀번호는 최소 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 서버 측에서 Cognito 비밀번호 재설정 확인 수행
    await cognitoServerService.confirmPassword(email, code, newPassword);
    
    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해주세요.'
    });
  } catch (error: any) {  
    // 에러 메시지 처리
    let errorMessage = '비밀번호 재설정 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error.code === 'CodeMismatchException') {
      errorMessage = '인증 코드가 일치하지 않습니다.';
      statusCode = 400;
    } else if (error.code === 'ExpiredCodeException') {
      errorMessage = '인증 코드가 만료되었습니다.';
      statusCode = 400;
    } else if (error.code === 'UserNotFoundException') {
      errorMessage = '등록되지 않은 사용자입니다.';
      statusCode = 404;
    } else if (error.code === 'InvalidPasswordException') {
      errorMessage = '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.';
      statusCode = 400;
    }
    
    return NextResponse.json(
      { message: errorMessage, code: error.code },
      { status: statusCode }
    );
  }
} 