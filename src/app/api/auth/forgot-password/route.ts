import { NextRequest, NextResponse } from 'next/server';
import { cognitoServerService } from '@/lib/server/cognito-server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 필수 필드 검증
    if (!email) {
      return NextResponse.json(
        { message: '이메일은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    // 서버 측에서 Cognito 비밀번호 재설정 요청 수행
    const result = await cognitoServerService.forgotPassword(email);
    
    return NextResponse.json({
      success: true,
      destination: result.CodeDeliveryDetails.Destination,
      message: '비밀번호 재설정 코드가 이메일로 전송되었습니다.'
    });
  } catch (error: unknown) {

    // 에러 메시지 처리
    let errorMessage = '비밀번호 재설정 요청 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    // 에러 객체에 code 속성이 있는지 확인
    if (error && typeof error === 'object' && 'code' in error) {
      const cognitoError = error as { code: string; message?: string };
      
      if (cognitoError.code === 'UserNotFoundException') {
        // 보안을 위해 사용자가 존재하지 않아도 성공 메시지 반환
        return NextResponse.json({
          success: true,
          message: '비밀번호 재설정 코드가 이메일로 전송되었습니다.'
        });
      } else if (cognitoError.code === 'LimitExceededException') {
        errorMessage = '요청 횟수가 제한을 초과했습니다. 잠시 후 다시 시도해주세요.';
        statusCode = 429;
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