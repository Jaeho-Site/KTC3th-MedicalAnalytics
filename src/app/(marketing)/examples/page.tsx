'use client';

import Link from 'next/link';
import Image from 'next/image';

// 분석 사례 데이터 (실제로는 API나 데이터베이스에서 가져올 수 있습니다)
const analysisExamples = [
  {
    id: '1',
    title: 'BT 각인 원형 흰색 알약 분석',
    image: '/images/pill1.jpg',
    date: '2024년 3월 15일',
    author: '김약사',
    summary: 'BT 각인이 있는 원형 흰색 알약에 대한 분석 결과입니다. 이 알약은 가나프리드정, 베포타스틴 계열 등 다양한 의약품과 일치하는 특징을 가지고 있습니다.',
  },
  {
    id: '2',
    title: 'TYLENOL 각인 타원형 흰색 알약 분석',
    image: '/images/pill2.jpg',
    date: '2024년 2월 20일',
    author: '이약사',
    summary: 'TYLENOL 각인이 있는 타원형 흰색 알약에 대한 분석 결과입니다. 이 알약은 타이레놀 계열 제품으로, 주성분은 아세트아미노펜(Acetaminophen)입니다.',
  },
  {
    id: '3',
    title: 'GD 각인 마름모형 분홍색 알약 분석',
    image: '/images/pill3.jpg',
    date: '2024년 1월 10일',
    author: '박약사',
    summary: 'GD 각인이 있는 마름모형 분홍색 알약에 대한 분석 결과입니다. 이 알약은 에이다파정10mg으로, 주성분은 다파글리플로진(Dapagliflozin)입니다.',
  },
];

export default function AnalysisExamples() {
  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <Link href="/" className="text-teal-600 hover:text-teal-700 mb-8 inline-block">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold mt-4">의약품 분석 사례</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">
            실제 의약품 분석 결과를 확인해보세요
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {analysisExamples.map((example) => (
            <div key={example.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                <Image
                  src={example.image}
                  alt={example.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 400px"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{example.title}</h2>
                
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4 text-sm">
                  <span>{example.date}</span>
                  <span className="mx-2">•</span>
                  <span>{example.author}</span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {example.summary}
                </p>
                
                <Link
                  href={`/examples/${example.id}`}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  자세히 보기 →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 