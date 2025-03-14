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

    // 비밀번호 강도 검증 (서버 측에서도 검증)
    if (password.length < 8) {
      return NextResponse.json(
        { message: '비밀번호는 최소 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 서버 측에서 Cognito 회원가입 수행
    const result = await cognitoServerService.signUp(email, password);
    
    return NextResponse.json({
      success: true,
      userConfirmed: result.userConfirmed,
      userSub: result.userSub,
      message: '회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.'
    });
  } catch (error: unknown) {
    // 에러 메시지 처리
    let errorMessage = '회원가입 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    // 에러 객체에 code 속성이 있는지 확인
    if (error && typeof error === 'object' && 'code' in error) {
      const cognitoError = error as { code: string; message?: string };
      
      if (cognitoError.code === 'UsernameExistsException') {
        errorMessage = '이미 등록된 이메일 주소입니다.';
        statusCode = 409;
      } else if (cognitoError.code === 'InvalidPasswordException') {
        errorMessage = '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.';
        statusCode = 400;
      } else if (cognitoError.code === 'InvalidParameterException') {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
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