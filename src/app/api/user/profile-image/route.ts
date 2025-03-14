import { NextRequest, NextResponse } from 'next/server';
import { 
  API_ENDPOINT, 
  validateAuthToken, 
  getAuthToken, 
  sendApiRequest, 
  createErrorResponse, 
  handleApiResponse 
} from '@/lib/server/api-utils';

// 프로필 이미지 API 엔드포인트
const PROFILE_IMAGE_ENDPOINT = `${API_ENDPOINT}/user/profile-image`;
/**
 * 프로필 이미지 업로드 (POST)
 */
export async function POST(request: NextRequest) {
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
    if (!body.email || !body.image) {
      return NextResponse.json(
        { message: '이메일과 이미지는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 이미지 크기 검증 (base64 문자열 길이로 대략적인 크기 계산)
    const base64Image = body.image;
    const approximateSizeInBytes = (base64Image.length * 3) / 4;
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    
    if (approximateSizeInBytes > maxSizeInBytes) {
      return NextResponse.json(
        { message: '이미지 크기는 5MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }
    // API 요청 전송
    const { data, response } = await sendApiRequest(
      PROFILE_IMAGE_ENDPOINT,
      {
        method: 'POST',
        body: JSON.stringify(body)
      },
      authToken!
    );
    
    // 응답 처리
    return handleApiResponse(data, response, '프로필 이미지 업로드에 실패했습니다.');
    
  } catch (error) {
    return createErrorResponse(error, '프로필 이미지 업로드 중 오류가 발생했습니다.');
  }
} 