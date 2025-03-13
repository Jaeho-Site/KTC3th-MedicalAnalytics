import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Cognito JWT 검증기 설정
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
  tokenUse: 'id',
});

// JWT 검증 함수
async function verifyAuth(token: string) {
  try {
    // Cognito의 JWKS를 사용하여 토큰 검증
    const payload = await verifier.verify(token);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  // 보호된 경로 확인
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/mypage')) {
    
    // 쿠키에서 토큰 가져오기
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // 토큰 검증
    const payload = await verifyAuth(token);
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/mypage/:path*'],
};