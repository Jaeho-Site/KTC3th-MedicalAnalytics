'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// API 엔드포인트 - 환경 변수 사용
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const USER_API_URL = `${API_BASE_URL}/user`;
const PROFILE_IMAGE_API_URL = `${API_BASE_URL}/user/profile-image`;

interface UserInfo {
  email: string;
  Username: string;
  joinDate: string;
  profileImage?: string;
}

// 사용자 이름 검증 함수
const validateUsername = (username: string): boolean => {
  // 최소 2자, 최대 30자, 알파벳, 숫자, 한글, 밑줄, 공백만 허용
  return /^[\w가-힣\s]{2,30}$/.test(username);
};

export default function MyPage() {
  const { user, isAuthenticated, isLoading, getAuthToken } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // 프로필 이미지 관련 상태
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사용자 정보 가져오기 함수
  const fetchUserInfo = async () => {
    if (!isAuthenticated || !user?.email) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 인증 토큰 가져오기
      const token = await getAuthToken();
      if (!token) {
        throw new Error('인증 토큰을 가져올 수 없습니다.');
      }
      
      const response = await fetch(
        `${USER_API_URL}?email=${encodeURIComponent(user.email)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error('사용자 정보를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('받은 사용자 정보:', data);
      
      setUserInfo(data);
      setUsername(data.Username || '');
      
      // 프로필 이미지가 있으면 설정
      if (data.profileImage) {
        setProfileImage(data.profileImage);
      }
    } catch (err) {
      console.error('사용자 정보 조회 오류');
      
      if (err instanceof Error && (err.message.includes('인증이 만료') || err.message.includes('인증 토큰'))) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        setError('사용자 정보를 가져오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchUserInfo();
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, user, isLoading]);

  // 사용자 정보 업데이트 핸들러
  const handleUpdateUserInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.email) return;
    
    // 사용자 이름 검증
    if (!validateUsername(username)) {
      setError('유효하지 않은 사용자 이름입니다. 2~30자의 알파벳, 숫자, 한글, 밑줄만 사용 가능합니다.');
      return;
    }
    
    // 변경사항이 없으면 업데이트 하지 않음
    if (username === userInfo?.Username) {
      setIsEditing(false);
      return;
    }
    
    setUpdateLoading(true);
    setError(null);
    
    try {
      // 인증 토큰 가져오기
      const token = await getAuthToken();
      if (!token) {
        throw new Error('인증 토큰을 가져올 수 없습니다.');
      }
      
      // 사용자 이름 업데이트
      const response = await fetch(
        USER_API_URL,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email: user.email,
            Username: username
          })
        }
      );
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error('사용자 이름 업데이트에 실패했습니다.');
      }
      
      const data = await response.json();
      
      // 성공 처리
      setUserInfo(prev => prev ? { ...prev, Username: data.Username } : null);
      setIsEditing(false);
      
      // 업데이트된 정보 다시 불러오기
      setTimeout(() => {
        fetchUserInfo();
      }, 1000);
      
    } catch (err) {
      console.error('사용자 정보 업데이트 오류');
      
      if (err instanceof Error && (err.message.includes('인증이 만료') || err.message.includes('인증 토큰'))) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        setError('사용자 정보 업데이트에 실패했습니다.');
      }
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // 이미지 파일 선택 및 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isAuthenticated || !user?.email) return;
    
    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }
    
    // 파일 형식 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // 파일을 Base64로 변환
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const imageData = reader.result;
          console.log('이미지 업로드 시작...');
          
          // 이미지 업로드 요청
          const response = await fetch(PROFILE_IMAGE_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              image: imageData
            })
          });
          
          console.log('업로드 응답 상태:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '이미지 업로드에 실패했습니다.');
          }
          
          const data = await response.json();
          console.log('업로드 성공:', data);
          
          if (data.imageUrl) {
            // 프로필 이미지 상태 업데이트
            setProfileImage(data.imageUrl);
            
            // 사용자 정보 업데이트
            setUserInfo(prev => prev ? { ...prev, profileImage: data.imageUrl } : null);
            
            // 최신 정보 가져오기
            await fetchUserInfo();
          } else {
            throw new Error('이미지 URL을 받지 못했습니다.');
          }
        } catch (error) {
          console.error('업로드 오류:', error);
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('이미지 업로드에 실패했습니다.');
          }
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        console.error('파일 읽기 오류');
        setError('이미지 파일을 읽는데 실패했습니다.');
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('일반 오류:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('이미지 처리 중 오류가 발생했습니다.');
      }
      setIsUploading(false);
    }
  };

  // 로그인 페이지로 이동
  const goToLogin = () => {
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">인증 상태 확인 중...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user?.email) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600 mb-4">로그인이 필요한 페이지입니다.</p>
        <button
          onClick={goToLogin}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">사용자 정보 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">마이페이지</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
          <div className="mt-2">
            <button
              onClick={() => setError(null)}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              닫기
            </button>
          </div>
        </div>
      )}
      
      {userInfo && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* 프로필 이미지 섹션 */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-blue-500">
                    {profileImage ? (
                      // 이미지가 있으면 표시
                      <img 
                        src={profileImage} 
                        alt="프로필 이미지" 
                        className="w-full h-full object-cover"
                        onError={() => {
                          // 이미지 로딩 오류 시 이니셜 표시
                          setProfileImage(null);
                        }}
                      />
                    ) : (
                      // 이미지가 없으면 이니셜 표시
                      <span className="text-5xl text-gray-400">
                        {userInfo.Username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    title="이미지 변경"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              {/* 사용자 정보 섹션 */}
              <div className="flex-1">
                {isEditing ? (
                  <form onSubmit={handleUpdateUserInfo}>
                    <div className="mb-4">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        사용자 이름
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        minLength={2}
                        maxLength={30}
                        pattern="^[\w가-힣\s]{2,30}$"
                        title="2~30자의 알파벳, 숫자, 한글, 밑줄만 사용 가능합니다."
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {updateLoading ? '저장 중...' : '저장하기'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setUsername(userInfo.Username);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800">{userInfo.Username}</h2>
                    <p className="text-gray-600 mt-1">{userInfo.email}</p>
                    <p className="text-gray-500 text-sm mt-2">가입일: {userInfo.joinDate}</p>
                    
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      사용자 이름 수정
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
