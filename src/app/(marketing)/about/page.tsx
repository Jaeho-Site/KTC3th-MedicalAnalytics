export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-8">
              더 안전한 의약품 사용을 위한 혁신
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              우리는 최신 AI 기술을 활용하여 의약품 분석의 새로운 기준을 제시합니다.
              정확하고 신뢰할 수 있는 분석으로 모든 사람이 안전하게 의약품을 사용할 수 있도록 돕습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">우리의 미션</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                의약품 정보의 투명성을 높이고, 누구나 쉽게 이해할 수 있는 분석 결과를 제공하여
                더 안전한 의약품 사용 문화를 만들어갑니다.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-teal-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>정확한 성분 분석으로 안전한 의약품 사용 지원</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-teal-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>누구나 이해하기 쉬운 분석 결과 제공</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-teal-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>지속적인 데이터베이스 업데이트와 기술 혁신</span>
                </li>
              </ul>
            </div>
            <div className="relative h-96">
              <img
                src="/images/dbimages.jpg"
                alt="Our Mission"
                className="rounded-2xl object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">전문가 팀</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-teal-100 dark:bg-teal-900 mx-auto mb-6 overflow-hidden">
                <img
                  src="/images/pill1.jpg"
                  alt="AI Research Lead"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI 연구 책임자</h3>
              <p className="text-gray-600 dark:text-gray-400">
                10년 이상의 머신러닝 연구 경력
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto mb-6 overflow-hidden">
                <img
                  src="/images/pill2.jpg"
                  alt="Pharmaceutical Expert"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">약학 전문가</h3>
              <p className="text-gray-600 dark:text-gray-400">
                제약 산업 15년 경력의 전문가
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-cyan-100 dark:bg-cyan-900 mx-auto mb-6 overflow-hidden">
                <img
                  src="/images/pill4.jpg"
                  alt="Data Scientist"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">데이터 사이언티스트</h3>
              <p className="text-gray-600 dark:text-gray-400">
                빅데이터 분석 및 모델링 전문가
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
