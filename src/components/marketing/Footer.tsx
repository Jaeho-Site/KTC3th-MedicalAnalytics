const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-300">
              약물의 이미지를 업로드하시면, AI가 정밀분석하여 
              의약품 데이터베이스에 검색합니다. Next.js와 Tailwind CSS를 사용하여 
              웹을 디자인했고, AWS를 사용하여 배포했습니다.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.kakaotechcampus.com/" className="text-gray-300 hover:text-white">
                    카카오 테크 캠퍼스
                </a>
              </li>
              <li>
                <a href="https://www.health.kr/" className="text-gray-300 hover:text-white">
                    약학정보원
                </a>
              </li>
              <li>
                <a href="https://gemini.google.com/app" className="text-gray-300 hover:text-white">
                    Gemini AI
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: sjaeho348@gmail.com</li>
              <li>Phone: (123) 456-7890</li>
              <li>Info: 충남대학교 컴퓨터융합학부</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} 약물 이미지 분석 서비스 Mediscan</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
