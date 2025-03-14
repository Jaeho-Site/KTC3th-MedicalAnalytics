import { NextRequest, NextResponse } from 'next/server';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function GET(request: NextRequest) {
  try {  
    // 쿠키에서 인증 토큰 가져오기 (여러 가능한 쿠키 이름 시도)
    const authToken = 
      request.cookies.get('authToken')?.value || 
      request.cookies.get('auth-token')?.value || 
      request.cookies.get('token')?.value ||
      request.cookies.get('next-auth.session-token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { message: '인증이 필요합니다. 쿠키에서 인증 토큰을 찾을 수 없습니다.' },
        { status: 401 }
      );
    }
    
    // API 기본 URL이 설정되어 있는지 확인
    if (!API_BASE_URL) {
      return NextResponse.json(
        { message: 'API 기본 URL이 설정되지 않았습니다. 환경 변수를 확인해주세요.' },
        { status: 500 }
      );
    }
    
    // URL 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { message: '이메일 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }  
    const response = await fetch(
      `${API_BASE_URL}/user?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    // 응답 데이터 가져오기
    const data = await response.json();
    
    // 응답 상태 코드에 따라 처리
    if (!response.ok) {
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }
    
    // 성공 응답 반환
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authToken = 
      request.cookies.get('authToken')?.value || 
      request.cookies.get('auth-token')?.value || 
      request.cookies.get('token')?.value ||
      request.cookies.get('next-auth.session-token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { message: '인증이 필요합니다. 쿠키에서 인증 토큰을 찾을 수 없습니다.' },
        { status: 401 }
      );
    }
    
    // API 기본 URL이 설정되어 있는지 확인
    if (!API_BASE_URL) {
      return NextResponse.json(
        { message: 'API 기본 URL이 설정되지 않았습니다. 환경 변수를 확인해주세요.' },
        { status: 500 }
      );
    }
    
    // 요청 본문 가져오기
    const body = await request.json();
    
    if (!body.email) {
      return NextResponse.json(
        { message: '이메일이 필요합니다.' },
        { status: 400 }
      );
    }
    // 외부 API 호출
    const response = await fetch(
      `${API_BASE_URL}/user`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(body) // 요청 본문을 그대로 전달
      }
    );
    // 응답 데이터 가져오기
    const data = await response.json();
    // 응답 상태 코드에 따라 처리
    if (!response.ok) {
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }
    
    // 성공 응답 반환
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 