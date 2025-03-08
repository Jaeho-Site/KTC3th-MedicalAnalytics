import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 환경 변수에서 API URL 가져오기
    const apiUrl = process.env.PILL_IDENTIFIER_API_URL;
    
    if (!apiUrl) {
      throw new Error('API URL이 설정되지 않았습니다.');
    }
    
    // EC2 서버로 요청 전달
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`서버 응답 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 