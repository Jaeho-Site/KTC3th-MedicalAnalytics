'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';

// 분석 사례 데이터 (실제로는 API나 데이터베이스에서 가져올 수 있습니다)
const analysisExamples = [
  {
    id: '1',
    title: 'BT 각인 원형 흰색 알약 분석',
    image: '/images/pill1.jpg',
    pillImage: '/images/example1.png',
    date: '2024년 3월 15일',
    author: '김약사',
    content: `
      ## BT 각인 원형 흰색 알약 분석 결과
      
      ### 알약 특징
      - 모양: 원형 (circular)
      - 색상: 흰색 (white)
      - 각인: BT
      
      ### 식별된 알약 목록
      - 가나프리드정 Itopride Hydrochloride 50mg
      - 네가박트정 Ofloxacin 100mg
      - 노플정 Pseudoephedrine Hydrochloride 60mg 외 1
      - 동화베포타스틴정 Bepotastine Besilate 10mg
      - 라비트에이정 Ranitidine Hydrochloride 84mg 외 2
      - 리보틴정150mg Ranitidine Hydrochloride 168mg
      - 메바톤정 Nabumetone 500mg
      - 멜그린정 L-Cysteine 40mg 외 2
      - 베라스트정 Beraprost Sodium 0.02mg

      
      ### 상세 검색 결과
      아래 표는 분석된 알약과 일치하는 의약품의 상세 정보를 보여줍니다.
    `,
    resultImage: '/images/e1result.png'
  },
  {
    id: '2',
    title: 'TYLENOL 각인 타원형 흰색 알약 분석',
    image: '/images/pill2.jpg',
    pillImage: '/images/example2.png',
    date: '2024년 2월 20일',
    author: '이약사',
    content: `
      ## TYLENOL 각인 타원형 흰색 알약 분석 결과
      
      ### 알약 특징
      - 모양: 타원형 (oblong)
      - 색상: 흰색 (white)
      - 각인: TYLENOL
      
      ### 식별된 알약 목록
      - 타이레놀8시간이알서방정 Acetaminophen 325mg 외 1
      - 타이레놀8시간이알서방정 Acetaminophen 650mg
      - 타이레놀정500mg Acetaminophen 500mg
      - 타이레놀정500mg Acetaminophen 500mg
      
      ### 상세 검색 결과
      아래 표는 분석된 알약과 일치하는 의약품의 상세 정보를 보여줍니다.
    `,
    resultImage: '/images/e2result.png'
  },
  {
    id: '3',
    title: 'GD 각인 마름모형 분홍색 알약 분석',
    image: '/images/pill3.jpg',
    pillImage: '/images/example3.png',
    date: '2024년 1월 10일',
    author: '박약사',
    content: `
      ## GD 각인 마름모형 분홍색 알약 분석 결과
      
      ### 알약 특징
      - 모양: 마름모형 (rhombus)
      - 색상: 분홍색 (pink)
      - 각인: GD
      
      ### 식별된 알약 목록
      - 에이다파정10mg Dapagliflozin Propanediol Hydrate 12.3mg
      
      ### 상세 검색 결과
      아래 표는 분석된 알약과 일치하는 의약품의 상세 정보를 보여줍니다.
    `,
    resultImage: '/images/e3result.png'
  },
];

export default function AnalysisExample() {
  const params = useParams();
  const [example, setExample] = useState<any>(null);
  
  useEffect(() => {
    // ID에 해당하는 분석 사례 찾기
    const id = params.id as string;
    const foundExample = analysisExamples.find(ex => ex.id === id);
    setExample(foundExample);
  }, [params.id]);

  if (!example) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">분석 사례를 찾을 수 없습니다</h1>
          <Link href="/" className="text-teal-600 hover:text-teal-700">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <Link href="/" className="text-teal-600 hover:text-teal-700 mb-8 inline-block">
          ← 홈으로 돌아가기
        </Link>
        
        <article className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
            <img
              src={example.image}
              alt={example.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{example.title}</h1>
            
            {example.pillImage && (
              <div className="mb-6 flex justify-center">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={example.pillImage}
                    alt="알약 이미지"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-8">
              <span>{example.date}</span>
              <span className="mx-2">•</span>
              <span>{example.author}</span>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {example.content.split('\n').map((paragraph: string, idx: number) => {
                if (paragraph.trim().startsWith('##')) {
                  const text = paragraph.replace(/^##\s+/, '');
                  return <h2 key={idx} className="text-2xl font-bold mt-8 mb-4">{text}</h2>;
                } else if (paragraph.trim().startsWith('###')) {
                  const text = paragraph.replace(/^###\s+/, '');
                  return <h3 key={idx} className="text-xl font-semibold mt-6 mb-3">{text}</h3>;
                } else if (paragraph.trim().startsWith('-')) {
                  const text = paragraph.replace(/^-\s+/, '');
                  return <li key={idx} className="ml-6 mb-1">{text}</li>;
                } else if (paragraph.trim()) {
                  return <p key={idx} className="mb-4">{paragraph}</p>;
                }
                return null;
              })}
              
              {example.resultImage && (
                <div className="mt-8">
                  <img
                    src={example.resultImage}
                    alt="상세 검색 결과"
                    className="w-full rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
} 