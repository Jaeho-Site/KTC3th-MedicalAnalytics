# Medical Analytics (의약품 이미지 분석 서비스)

## 🏗 시스템 아키텍처

![AWS 시스템 아키텍처](/public/README/images/AWS-Diagram.png)

시스템 아키텍처는 위 다이어그램과 같으며, 실제 구현에는 사용자 인증, 프로필 관리, 이미지 처리 등 다양한 기능을 위한 Lambda 함수들이 추가로 구현되어 있습니다.

## 💫 반응형 디자인

MediScan은 모든 디바이스에서 완벽한 사용자 경험을 제공합니다. 데스크톱부터 모바일까지 모든 화면 크기에 최적화된 반응형 디자인을 적용하여, 언제 어디서나 편리하게 서비스를 이용할 수 있습니다.

<div align="center">
  <img src="/public/README/images/Home1.png" alt="홈 화면 1" width="24%" />
  <img src="/public/README/images/Home2.png" alt="홈 화면 2" width="24%" />
  <img src="/public/README/images/Home3_blog.png" alt="블로그 화면 1" width="24%" />
  <img src="/public/README/images/Home4_blog.png" alt="블로그 화면 2" width="24%" />
</div>

<div align="center">
  <img src="/public/README/images/pricing.png" alt="가격 정책" width="32%" />
  <img src="/public/README/images/login.png" alt="로그인" width="32%" />
  <img src="/public/README/images/signup.png" alt="회원가입" width="32%" />
</div>

## 📌 프로젝트 소개

### 🎯 Marketing

#### 메인 페이지
![마케팅 페이지 데모](/public/README/gifs/marketing.gif)

MediScan의 메인 페이지는 직관적이고 현대적인 디자인을 통해 서비스의 핵심 가치를 전달합니다. 의약품 이미지 분석 서비스의 주요 기능과 장점을 한눈에 파악할 수 있도록 구성되어 있으며, 사용자 친화적인 UI/UX를 제공합니다.

- Next.js 15 (App Router)
  ```tsx
  // App 라우팅 구조 예시
  src/
  ├── app/
  │   ├── (marketing)/     # 그룹화된 마케팅 라우트
  │   │   ├── page.tsx     # 메인 페이지 (/)
  │   │   ├── about/       # 소개 페이지 (/about)
  │   │   └── examples/    # 분석 사례 (/examples/[id])
  │   │       └── [id]/    # 동적 라우팅으로 개별 사례 페이지 구현
  │   └── (dashboard)/     # 인증된 사용자용 라우트 그룹
  ```

#### Next.js 주요 기능 활용

- **App 라우팅 아키텍처**
  - 폴더 기반 라우팅 시스템 구현
  - `(marketing)`, `(dashboard)` 그룹으로 페이지 구조화
  - `[id]`를 활용한 동적 라우팅으로 분석 사례 페이지 구현
  - 미들웨어를 통한 인증 상태 기반 라우팅 제어

- **Header, Footer**
  ```tsx
  src/
  ├── components/
  │   ├── marketing/
  │   │   ├── Header.tsx   # 네비게이션 기능 제공
  │   │   └── Footer.tsx   # 프로젝트 정보 및 링크 제공
  │   └── dashboard/
  ```
  - 공통 레이아웃 컴포넌트를 `layout.tsx`에서 중앙 관리
  - Header: 반응형 네비게이션 바, 인증 상태에 따른 조건부 렌더링
  - Footer: 프로젝트 관련 링크 및 정보 제공

- **페이지 전환 및 인증 플로우**
  - 분석 시작하기 → 비인증 사용자 로그인 페이지 리디렉션
  - 의약품 데이터베이스 → 소개 페이지 자동 라우팅
  - 무료로 서비스 시작하기 -> 요금제 페이지로 자동 라우팅
  - 미들웨어를 통한 보호된 라우트 접근 제어
  

#### 사용자 인증 시스템
![인증 시스템 데모](/public/README/gifs/auth.gif)

AWS Cognito를 활용한 안전하고 신뢰성 있는 사용자 인증 시스템을 구현했습니다:
- 이메일 기반의 회원가입 및 로그인
- 비밀번호 재설정 및 이메일 인증
- JWT 기반의 안전한 세션 관리

- **인증 시스템 아키텍처**
  ```tsx
  src/
  ├── app/
  │   ├── (marketing)/
  │   │   └── (auth)/           # 인증 관련 페이지 그룹
  │   │       ├── login/        # 로그인 페이지
  │   │       ├── signup/       # 회원가입 페이지
  │   │       ├── reset-password/# 비밀번호 재설정
  │   │       └── verify-email/ # 이메일 인증
  │   └── api/
  │       └── auth/             # 인증 관련 API 엔드포인트
  │           ├── confirm-password/
  │           ├── confirm-signup/
  │           ├── forgot-password/
  │           ├── session/
  │           ├── set-cookie/
  │           ├── signin/
  │           ├── signout/
  │           └── signup/
  ```

- **컴포넌트 및 보안**
  ```tsx
  src/
  ├── components/
  │   └── core/
  │       └── auth/
  │           └── ProtectedRoute.tsx    # 인증된 사용자만 접근 가능한 라우트 보호
  ├── contexts/
  │   └── AuthContext.tsx              # 전역 인증 상태 관리
  ├── lib/
  │   ├── auth-types.ts               # 인증 관련 타입 정의
  │   └── server/
  │       └── cognito-server.ts       # Cognito 서버 사이드 유틸리티
  └── middleware.ts                    # 전역 인증 미들웨어
  ```

- **Next.js API 라우트 기능**
  - `/auth/signin`: 로그인 처리 및 세션 생성
  - `/auth/signup`: 회원가입 및 이메일 인증 발송
  - `/auth/confirm-signup`: 이메일 인증 확인
  - `/auth/forgot-password`: 비밀번호 재설정 요청
  - `/auth/confirm-password`: 새 비밀번호 설정
  - `/auth/session`: 세션 상태 확인 및 갱신
  - `/auth/signout`: 로그아웃 및 세션 제거

- **보안 기능**
  - ProtectedRoute 컴포넌트로 인증 필요 페이지 보호
  - 전역 미들웨어를 통한 인증 상태 검증
  - AWS Cognito의 보안 토큰 관리
  - 서버 사이드 세션 관리
  - API 엔드포인트 보호

### 🎯 Dashboard

#### 마이페이지
![마이페이지 데모](/public/README/gifs/MyPage.gif)

사용자 맞춤형 대시보드를 통해 개인화된 서비스 경험을 제공합니다:
- API Gateway REST API를 통한 사용자 프로필 관리
  - Lambda 함수를 통한 DynamoDB 사용자 정보 CRUD 작업
  - S3를 활용한 프로필 이미지 저장 및 관리
  - 실시간 프로필 정보 업데이트 및 조회
- 사용자 설정 커스터마이징
  - DynamoDB에서 사용자별 설정 데이터 관리
  - Lambda 함수를 통한 설정 동기화

#### 의약품 분석 서비스
![서비스 동작 데모](/public/README/gifs/design.gif)

실시간 의약품 이미지 분석 시스템을 통해 신속하고 정확한 정보를 제공합니다:
- EC2 인스턴스에 배포된 Flask 애플리케이션
  - 의약품 이미지 분석 AI 모델 실행
  - 실시간 분석 결과 제공
- API Gateway REST API HTTP 통합
  - EC2의 Flask 엔드포인트와 직접 통합
  - 이미지 업로드 및 분석 결과 실시간 반환

## 🏗 프로젝트 구조

```
MedicalAnalyitics/
├── .env.local
├── .eslintrc.json
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── api/
    │   │   ├── auth/
    │   │   │   ├── confirm-password/
    │   │   │   │   └── route.ts
    │   │   │   ├── confirm-signup/
    │   │   │   │   └── route.ts
    │   │   │   ├── forgot-password/
    │   │   │   │   └── route.ts
    │   │   │   ├── session/
    │   │   │   │   └── route.ts
    │   │   │   ├── set-cookie/
    │   │   │   │   └── route.ts
    │   │   │   ├── signin/
    │   │   │   │   └── route.ts
    │   │   │   ├── signout/
    │   │   │   │   └── route.ts
    │   │   │   └── signup/
    │   │   │       └── route.ts
    │   │   ├── proxy/
    │   │   │   └── user/
    │   │   │       ├── get-image/
    │   │   │       │   └── route.ts
    │   │   │       ├── profile-image/
    │   │   │       │   └── route.ts
    │   │   │       └── route.ts
    │   │   └── user/
    │   │       ├── get-image/
    │   │       │   └── route.ts
    │   │       ├── profile-image/
    │   │       │   └── route.ts
    │   │       └── route.ts
    │   ├── (dashboard)/
    │   │   ├── layout.tsx
    │   │   ├── dashboard/
    │   │   │   └── page.tsx
    │   │   └── mypage/
    │   │       └── page.tsx
    │   └── (marketing)/
    │       ├── layout.tsx
    │       ├── page.tsx
    │       ├── about/
    │       │   └── page.tsx
    │       ├── examples/
    │       │   ├── page.tsx
    │       │   └── [id]/
    │       │       └── page.tsx
    │       ├── pricing/
    │       │   └── page.tsx
    │       └── (auth)/
    │           ├── login/
    │           │   └── page.tsx
    │           ├── signup/
    │           │   └── page.tsx
    │           ├── reset-password/
    │           │   └── page.tsx
    │           └── verify-email/
    │               └── page.tsx
    ├── components/
    │   ├── core/
    │   │   └── auth/
    │   │       └── ProtectedRoute.tsx
    │   ├── dashboard/
    │   │   └── Header.tsx
    │   └── marketing/
    │       ├── Button.tsx
    │       ├── Footer.tsx
    │       └── Header.tsx
    ├── contexts/
    │   └── AuthContext.tsx
    ├── lib/
    │   ├── api.ts
    │   ├── auth-types.ts
    │   └── server/
    │       ├── api-utils.ts
    │       └── cognito-server.ts
    └── middleware.ts
```

## 🔧 기술 스택

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS

### Backend (Serverless)
- AWS Lambda
- AWS API Gateway
- AWS Cognito
- AWS S3
- AWS EC2 (Flask 기반 의약품 분석 서비스 호스팅)

### 배포
- AWS Amplify

### ETC
- Git
- Github

## 🔐 보안
- AWS Cognito를 통한 안전한 사용자 인증
- API Gateway를 통한 요청 검증
- HTTPS 적용

