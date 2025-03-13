'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pillInfo, setPillInfo] = useState<{
    shape: string;
    color: string;
    imprint: string;
  } | null>(null);
  const [identifiedPills, setIdentifiedPills] = useState<string[]>([]);
  const [resultHtml, setResultHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
      
      // 결과 초기화
      setPillInfo(null);
      setIdentifiedPills([]);
      setResultHtml('');
      setShowResults(false);
    }
  };

  const identifyPill = async () => {
    if (!file) {
      setError('이미지를 선택해주세요.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setShowResults(false);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // 직접 API Gateway 호출 (클라이언트 측 코드)
      const apiUrl = process.env.NEXT_PUBLIC_PILL_IDENTIFIER_API_URL;
      
      if (!apiUrl) {
        throw new Error('API URL이 설정되지 않았습니다.');
      }
      
      const response = await fetch(`${apiUrl}/identify`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setPillInfo(data.pill_info);
      setIdentifiedPills(data.identified_pills);
      
      let processedHtml = data.result_html;
      if (processedHtml) {        
        processedHtml = processedHtml.replace(/onclick="drugDetail\([^)]*\)"/g, '');          
        setResultHtml(processedHtml);
      }
      
      setShowResults(true);
    } catch (err: unknown) {
      console.error('분석 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '알약 이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.';
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">알약 식별 시스템</h1>
        
        {/* 업로드 섹션 */}
        <div className="text-center mb-6">
          <input 
            type="file" 
            id="imageInput" 
            ref={fileInputRef}
            accept="image/*" 
            onChange={handleFileChange}
            className="mb-4 p-2 w-full max-w-md mx-auto"
          />
          
          {preview && (
            <div className="my-4 flex justify-center">
              <Image 
                src={preview} 
                alt="이미지 미리보기" 
                width={300}
                height={300}
                className="max-w-[300px] max-h-[300px] object-contain"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          )}
          
          <button
            onClick={identifyPill}
            disabled={analyzing || !file}
            className={`px-5 py-2 rounded-md font-medium ${
              analyzing || !file 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {analyzing ? '분석 중...' : '식별하기'}
          </button>
        </div>
        
        {/* 로딩 표시 */}
        {analyzing && (
          <div className="text-center my-8 p-6 bg-gray-50 rounded-md">
            <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">분석 중입니다...</p>
          </div>
        )}
        
        {/* 에러 메시지 */}
        {error && (
          <div className="my-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        {/* 결과 섹션 */}
        {showResults && (
          <div className="mt-8 p-6 bg-gray-50 rounded-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">분석 결과</h2>
            
            {/* 알약 특징 정보 */}
            {pillInfo && (
              <div className="bg-white p-5 rounded-md shadow-sm mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">알약 특징</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    모양: <span className="font-semibold text-gray-900">{pillInfo.shape}</span>
                  </p>
                  <p className="text-gray-700">
                    색상: <span className="font-semibold text-gray-900">{pillInfo.color}</span>
                  </p>
                  <p className="text-gray-700">
                    각인: <span className="font-semibold text-gray-900">{pillInfo.imprint}</span>
                  </p>
                </div>
              </div>
            )}
            
            {/* 식별된 알약 목록 */}
            {identifiedPills && identifiedPills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">식별된 알약 목록</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  {identifiedPills.map((pill, index) => (
                    <li key={index} className="text-gray-700">{pill}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* 상세 검색 결과 */}
            {resultHtml && (
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">상세 검색 결과</h3>
                <div 
                  className="overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: resultHtml }} 
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 추가 정보 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">알약 식별 시스템 사용 방법</h2>
        <ol className="list-decimal list-inside space-y-3 pl-2">
          <li className="text-gray-700">알약의 이미지를 촬영하거나 갤러리에서 선택합니다.</li>
          <li className="text-gray-700">이미지를 업로드한 후 &apos;식별하기&apos; 버튼을 클릭합니다.</li>
          <li className="text-gray-700">시스템이 알약의 특징을 분석하고 유사한 알약을 찾아 결과를 표시합니다.</li>
          <li className="text-gray-700">결과에서 알약의 정보를 확인할 수 있습니다.</li>
        </ol>
        <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-md">
          <p className="font-medium">주의사항:</p>
          <p className="mt-1 text-sm">이 시스템은 참고용으로만 사용하시고, 정확한 의약품 정보는 의사나 약사에게 문의하세요.</p>
        </div>
      </div>
    </div>
  );
}

