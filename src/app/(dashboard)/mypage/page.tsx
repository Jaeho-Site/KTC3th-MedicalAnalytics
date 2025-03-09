'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface UserInfo {
  email: string;
  Username: string;
  joinDate: string;
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
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // 사용자 정보 가져오기
  useEffect(() => {
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
        
        if (process.env.NODE_ENV === 'development') {
          console.log('사용자 정보 요청 중...');
        }
        
        const response = await fetch(
          `${API_BASE_URL}/user?email=${encodeURIComponent(user.email)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (process.env.NODE_ENV === 'development') {
          console.log('API 응답 상태:', response.status);
        }
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
          }
          throw new Error('사용자 정보를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        
        if (process.env.NODE_ENV === 'development') {
          console.log('사용자 정보 수신 완료');
        }
        
        setUserInfo(data);
        setUsername(data.Username);
      } catch (err) {
        console.error('사용자 정보 조회 오류');
        if (process.env.NODE_ENV === 'development' && err instanceof Error) {
          console.error('상세 오류:', err.message);
        }
        
        if (err instanceof Error && (err.message.includes('인증이 만료') || err.message.includes('인증 토큰'))) {
          setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else {
          setError('사용자 정보를 가져오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserInfo();
  }, [isAuthenticated, user, getAuthToken]);

  // 사용자 정보 업데이트 핸들러
  const handleUpdateUserInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.email) return;
    
    // 사용자 이름 검증
    if (!validateUsername(username)) {
      setError('유효하지 않은 사용자 이름입니다. 2~30자의 알파벳, 숫자, 한글, 밑줄만 사용 가능합니다.');
      return;
    }
    
    setUpdateLoading(true);
    setError(null);
    setUpdateSuccess(false);
    
    try {
      // 인증 토큰 가져오기
      const token = await getAuthToken();
      if (!token) {
        throw new Error('인증 토큰을 가져올 수 없습니다.');
      }
      
      // 사용자 이름 업데이트
      if (username !== userInfo?.Username) {
        if (process.env.NODE_ENV === 'development') {
          console.log('사용자 이름 업데이트 요청 중...');
        }
        
        const response = await fetch(
          `${API_BASE_URL}/user`,
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
        
        if (process.env.NODE_ENV === 'development') {
          console.log('API 응답 상태:', response.status);
        }
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
          }
          throw new Error('사용자 이름 업데이트에 실패했습니다.');
        }
        
        const data = await response.json();
        setUserInfo(prev => prev ? { ...prev, Username: data.Username } : null);
      }
      
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (err) {
      console.error('사용자 정보 업데이트 오류');
      if (process.env.NODE_ENV === 'development' && err instanceof Error) {
        console.error('상세 오류:', err.message);
      }
      
      if (err instanceof Error && (err.message.includes('인증이 만료') || err.message.includes('인증 토큰'))) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        setError('사용자 정보 업데이트에 실패했습니다.');
      }
    } finally {
      setUpdateLoading(false);
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
              onClick={goToLogin}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              다시 로그인하기
            </button>
          </div>
        </div>
      )}
      
      {updateSuccess && (
        <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6">
          프로필이 성공적으로 업데이트되었습니다.
        </div>
      )}
      
      {userInfo && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col gap-4">
              {/* 사용자 정보 */}
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
