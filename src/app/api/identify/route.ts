import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // API Gateway URL 사용
    const apiUrl = process.env.PILL_IDENTIFIER_API_URL;
    
    if (!apiUrl) {
      console.error('API URL이 설정되지 않았습니다.');
      return NextResponse.json(
        { error: 'API URL이 설정되지 않았습니다. 서버 관리자에게 문의하세요.' },
        { status: 500 }
      );
    } 
    // API Gateway로 요청 전달
    const response = await fetch(`${apiUrl}/identify`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '응답 내용을 가져올 수 없습니다.');
      console.error(`서버 응답 오류: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `서버 응답 오류: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 