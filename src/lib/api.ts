// API 요청을 위한 유틸리티 함수

// 안전한 로깅을 위한 유틸리티 함수
const safeLogError = (message: string, error?: Error | unknown) => {
  // 프로덕션 환경에서는 최소한의 오류 정보만 로깅
  if (process.env.NODE_ENV === 'production') {
    console.error(message);
    return;
  }
  
  // 개발 환경에서는 더 자세한 정보 로깅
  console.error(message, error);
};

/**
 * 인증이 필요한 API 요청을 보내는 함수
 * HttpOnly 쿠키에 저장된 토큰이 자동으로 요청에 포함됨
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // 기본 헤더 설정
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  try {
    // 요청 보내기 (쿠키는 자동으로 포함됨)
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // 쿠키를 포함하기 위해 필요
    });
    
    // 인증 오류 처리 (401)
    if (response.status === 401) {
      // 인증 이벤트 발생 (AuthContext에서 처리)
      window.dispatchEvent(new CustomEvent('auth-change'));
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    }
    
    // 토큰 만료 오류 처리 (403)
    if (response.status === 403) {
      try {
        const errorData = await response.json();
        if (errorData.message === 'Token expired') {
          // 토큰 갱신 이벤트 발생
          window.dispatchEvent(new CustomEvent('token-refresh-needed'));
          throw new Error('인증 토큰이 만료되었습니다. 다시 로그인해주세요.');
        }
      } catch {
        // JSON 파싱 오류는 무시하고 원래 응답 반환
      }
    }
    
    return response;
  } catch (error) {
    // 네트워크 오류 처리
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      safeLogError('네트워크 연결 오류', error);
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
    }
    
    safeLogError('API 요청 오류', error);
    throw error;
  }
}

/**
 * GET 요청 헬퍼 함수
 */
export async function getWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetchWithAuth(url, {
    ...options,
    method: 'GET',
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '알 수 없는 오류');
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

/**
 * POST 요청 헬퍼 함수
 */
export async function postWithAuth<T>(url: string, data: Record<string, unknown>, options: RequestInit = {}): Promise<T> {
  const response = await fetchWithAuth(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '알 수 없는 오류');
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

/**
 * PUT 요청 헬퍼 함수
 */
export async function putWithAuth<T>(url: string, data: Record<string, unknown>, options: RequestInit = {}): Promise<T> {
  const response = await fetchWithAuth(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '알 수 없는 오류');
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

/**
 * DELETE 요청 헬퍼 함수
 */
export async function deleteWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetchWithAuth(url, {
    ...options,
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '알 수 없는 오류');
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }
  
  return response.json();
} 