import { NextRequest, NextResponse } from 'next/server';
import { 
  API_ENDPOINT, 
  validateAuthToken, 
  getAuthToken, 
  sendApiRequest, 
  createErrorResponse, 
  handleApiResponse 
} from '@/lib/server/api-utils';

// 사용자 API 엔드포인트
const USER_ENDPOINT = `${API_ENDPOINT}/user`;

// 개발 환경에서 API 엔드포인트 로깅
if (process.env.NODE_ENV === 'development') {
  console.log('사용자 API 엔드포인트:', USER_ENDPOINT);
}

/**
 * 사용자 정보 조회 (GET)
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 토큰 검증
    const authValidation = validateAuthToken(request);
    if (!authValidation.valid) {
      return authValidation.response;
    }
    
    // 인증 토큰 가져오기
    const authToken = getAuthToken(request);
    
    // URL 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { message: '이메일은 필수 파라미터입니다.' },
        { status: 400 }
      );
    }
    
    // 개발 환경에서 요청 정보 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('사용자 정보 조회 요청:', {
        url: `${USER_ENDPOINT}?email=${encodeURIComponent(email)}`,
        method: 'GET'
      });
    }
    
    // API 요청 전송
    const { data, response } = await sendApiRequest(
      `${USER_ENDPOINT}?email=${encodeURIComponent(email)}`,
      { method: 'GET' },
      authToken!
    );
    
    // 개발 환경에서 응답 정보 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('사용자 정보 조회 응답:', {
        status: response.status,
        ok: response.ok,
        data
      });
    }
    
    // 응답 처리
    return handleApiResponse(data, response, '사용자 정보를 가져오는데 실패했습니다.');
    
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return createErrorResponse(error, '사용자 정보 조회 중 오류가 발생했습니다.');
  }
}

/**
 * 사용자 정보 업데이트 (PUT)
 */
export async function PUT(request: NextRequest) {
  try {
    // 인증 토큰 검증
    const authValidation = validateAuthToken(request);
    if (!authValidation.valid) {
      return authValidation.response;
    }
    
    // 인증 토큰 가져오기
    const authToken = getAuthToken(request);
    
    // 요청 본문 가져오기
    const body = await request.json();
    
    // 필수 필드 검증
    if (!body.email) {
      return NextResponse.json(
        { message: '이메일은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 개발 환경에서 요청 정보 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('사용자 정보 업데이트 요청:', {
        url: USER_ENDPOINT,
        method: 'PUT',
        body
      });
    }
    
    // API 요청 전송
    const { data, response } = await sendApiRequest(
      USER_ENDPOINT,
      {
        method: 'PUT',
        body: JSON.stringify(body)
      },
      authToken!
    );
    
    // 개발 환경에서 응답 정보 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('사용자 정보 업데이트 응답:', {
        status: response.status,
        ok: response.ok,
        data
      });
    }
    
    // 응답 처리
    return handleApiResponse(data, response, '사용자 정보 업데이트에 실패했습니다.');
    
  } catch (error) {
    console.error('사용자 정보 업데이트 오류:', error);
    return createErrorResponse(error, '사용자 정보 업데이트 중 오류가 발생했습니다.');
  }
} 