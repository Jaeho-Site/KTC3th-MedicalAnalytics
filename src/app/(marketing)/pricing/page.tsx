export default function PricingPage() {
  return (
    <div className="min-h-screen py-20">
      {/* Pricing Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">합리적인 가격 정책</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          많은곳에서 사용되는 pricing디자인만 적용했습니다.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold mb-4">기본</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">무료</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                기본 의약품 분석 1회
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                기본 데이터베이스 접근
              </li>
            </ul>
            <button className="w-full py-3 rounded-lg bg-teal-100 text-teal-700 font-medium hover:bg-teal-200 transition-colors">
              시작하기
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-2xl shadow-lg p-8 transform scale-105">
            <h3 className="text-2xl font-semibold mb-4">프로</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">₩9,000</span>
              <span className="text-sm opacity-80">/월</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                무제한 의약품 분석
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                전체 데이터베이스 접근
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                상세 분석 리포트
              </li>
            </ul>
            <button className="w-full py-3 rounded-lg bg-white text-teal-600 font-medium hover:bg-gray-50 transition-colors">
              시작하기
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold mb-4">기업</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">문의</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                맞춤형 API 제공
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                전담 기술 지원
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                SLA 제공
              </li>
            </ul>
            <button className="w-full py-3 rounded-lg bg-teal-100 text-teal-700 font-medium hover:bg-teal-200 transition-colors">
              문의하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
