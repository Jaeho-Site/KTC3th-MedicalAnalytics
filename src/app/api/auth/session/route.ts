import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/server/cognito-server';

export async function GET(request: NextRequest) {
  try {
    // 쿠키에서 토큰 가져오기
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 401 }
      );
    }
    
    // 토큰 검증
    const { valid, payload } = await verifyToken(authToken);
    
    if (!valid || !payload) {
      // 토큰이 유효하지 않으면 401 반환
      return NextResponse.json(
        { isAuthenticated: false, message: '인증이 만료되었습니다.' },
        { status: 401 }
      );
    }
    
    // 클라이언트에 필요한 최소한의 정보만 반환
    return NextResponse.json({
      isAuthenticated: true,
      user: {
        email: payload.email,
        sub: payload.sub
      }
    });
  } catch{
    return NextResponse.json(
      { isAuthenticated: false, message: '세션 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 