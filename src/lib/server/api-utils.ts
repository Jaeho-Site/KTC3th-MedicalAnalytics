import { NextRequest, NextResponse } from 'next/server';

// AWS API Gateway 엔드포인트
export const API_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL;

// 개발 환경에서 API 엔드포인트 로깅
if (process.env.NODE_ENV === 'development') {
  console.log('API 기본 엔드포인트:', API_ENDPOINT);
}

/**
 * 인증 토큰 가져오기
 */
export function getAuthToken(request: NextRequest): string | null {
  return request.cookies.get('auth-token')?.value || null;
}

/**
 * 인증 토큰 검증
 */
export function validateAuthToken(request: NextRequest): { valid: boolean; response?: NextResponse } {
  const token = getAuthToken(request);
  
  if (!token) {
    return {
      valid: false,
      response: NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    };
  }
  
  return { valid: true };
}

/**
 * API 요청 전송
 */
export async function sendApiRequest(url: string, options: RequestInit, authToken?: string): Promise<{ data: any; response: Response }> {
  try {
    // 헤더 설정
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };
    
    // 인증 토큰이 있으면 헤더에 추가
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // 개발 환경에서 요청 정보 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('API 요청 세부 정보:', {
        url,
        method: options.method || 'GET',
        headers: { ...headers, Authorization: authToken ? '(토큰 있음)' : '(토큰 없음)' }
      });
    }
    
    // API 요청 전송
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // 응답 데이터 가져오기
    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('응답 JSON 파싱 오류:', error);
      data = null;
    }
    
    // 개발 환경에서 응답 정보 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('API 응답 세부 정보:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        hasData: data !== null
      });
    }
    
    return { data, response };
  } catch (error) {
    console.error('API 요청 오류:', error);
    throw error;
  }
}

/**
 * 오류 응답 생성
 */
export function createErrorResponse(error: unknown, defaultMessage: string = '서버 오류가 발생했습니다.'): NextResponse {
  console.error(`API 오류: ${defaultMessage}`, error);
  
  if (error instanceof Error) {
    return NextResponse.json(
      { message: error.message || defaultMessage },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { message: defaultMessage },
    { status: 500 }
  );
}

/**
 * 응답 처리
 */
export function handleApiResponse(data: any, response: Response, errorMessage: string): NextResponse {
  if (!response.ok) {
    // 개발 환경에서 오류 응답 로깅
    if (process.env.NODE_ENV === 'development') {
      console.error('API 오류 응답:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
    }
    
    return NextResponse.json(
      data || { message: errorMessage },
      { status: response.status }
    );
  }
  
  return NextResponse.json(data);
} 