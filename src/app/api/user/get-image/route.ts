import { NextRequest, NextResponse } from 'next/server';
import { 
  API_ENDPOINT, 
  validateAuthToken, 
  getAuthToken, 
  sendApiRequest, 
  createErrorResponse, 
  handleApiResponse 
} from '@/lib/server/api-utils';

// 이미지 URL 조회 API 엔드포인트
const GET_IMAGE_ENDPOINT = `${API_ENDPOINT}/user/get-image`;

// 개발 환경에서 API 엔드포인트 로깅
if (process.env.NODE_ENV === 'development') {
  console.log('이미지 URL 조회 API 엔드포인트:', GET_IMAGE_ENDPOINT);
}

/**
 * 이미지 URL 조회 (GET)
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
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { message: '이미지 키는 필수 파라미터입니다.' },
        { status: 400 }
      );
    }
    
    // 개발 환경에서 요청 정보 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('이미지 URL 조회 요청:', {
        url: `${GET_IMAGE_ENDPOINT}?key=${encodeURIComponent(key)}`,
        method: 'GET',
        key
      });
    }
    
    // API 요청 전송
    const { data, response } = await sendApiRequest(
      `${GET_IMAGE_ENDPOINT}?key=${encodeURIComponent(key)}`,
      { method: 'GET' },
      authToken!
    );
    
    // 개발 환경에서 응답 정보 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('이미지 URL 조회 응답:', {
        status: response.status,
        ok: response.ok,
        data: data ? { ...data, url: data.url ? '(URL 존재)' : '(URL 없음)' } : null
      });
    }
    
    // 응답 처리
    return handleApiResponse(data, response, '이미지 URL을 가져오는데 실패했습니다.');
    
  } catch (error) {
    console.error('이미지 URL 조회 오류:', error);
    return createErrorResponse(error, '이미지 URL 조회 중 오류가 발생했습니다.');
  }
} 