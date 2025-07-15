# 🤖 EduTech ChatBot

> AI 기반 교육 챗봇 서비스 - QR 코드를 통한 인터랙티브 학습 경험

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [기술 스택](#-기술-스택)
3. [빠른 시작](#-빠른-시작)
4. [배포 가이드](#-배포-가이드)
5. [개발 환경 설정](#-개발-환경-설정)
6. [API 문서](#-api-문서)
7. [문제 해결](#-문제-해결)
8. [기여하기](#-기여하기)

---

## 🎯 프로젝트 개요

EduTech ChatBot은 QR 코드를 통해 교육 콘텐츠에 접근하고, AI 기반 학습 도우미와 대화할 수 있는 교육 기술 플랫폼입니다.

### 주요 기능

- **🔍 QR 코드 기반 학습**: 교재의 각 지문마다 고유한 QR 코드 생성
- **🤖 AI 학습 도우미**: OpenAI GPT를 활용한 개인화된 학습 지원
- **👑 관리자 대시보드**: 교재, 지문, 문제 관리 시스템
- **📝 자동 해설 생성**: AI 기반 문제 해설 자동 생성
- **📊 시스템 프롬프트 관리**: 버전 관리 기능이 있는 프롬프트 시스템

### 서비스 구성

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   사용자 (학생)    │ -> │  프론트엔드        │ -> │     백엔드        │
│  QR 코드 스캔     │    │   (Next.js)     │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        |
                                                        v
                                              ┌─────────────────┐
                                              │ MongoDB Atlas   │
                                              │   + OpenAI API  │
                                              └─────────────────┘
```

---

## 🛠️ 기술 스택

### 프론트엔드
- **Framework**: Next.js 15.3.5
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **State Management**: Zustand 5.0.6
- **HTTP Client**: Axios 1.10.0
- **UI Components**: Lucide React, React Markdown
- **Deployment**: Vercel

### 백엔드
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.8.3
- **Database**: MongoDB + Mongoose 8.16.3
- **AI Integration**: OpenAI GPT API 5.9.0
- **Deployment**: Railway

### 데이터베이스
- **Primary**: MongoDB Atlas (클라우드)
- **Features**: 자동 스케일링, 백업, 모니터링

---

## 🚀 빠른 시작

### 1. 자동 배포 (권장)

```bash
# 저장소 클론
git clone https://github.com/jjhmonolith/yuriaichatbot.git
cd yuriaichatbot

# 환경 변수 설정 (대화형)
./scripts/setup-env.sh --interactive

# 전체 배포 실행
./scripts/deploy.sh

# 배포 상태 확인
./scripts/health-check.sh
```

### 2. 수동 배포

```bash
# 환경 변수 템플릿 생성
./scripts/setup-env.sh --template

# .env 파일 편집
cp .env.template .env
nano .env

# 환경 변수 로드
source .env

# 백엔드 배포
cd backend
npm install
npm run build
railway up

# 프론트엔드 배포
cd ../frontend
npm install
npm run build
vercel --prod
```

---

## 📚 배포 가이드

### 완전한 배포 가이드

자세한 배포 가이드는 [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)를 참고하세요.

### 핵심 명령어

```bash
# 🚀 배포 관련
./scripts/deploy.sh                    # 전체 배포
./scripts/health-check.sh              # 상태 확인
./scripts/rollback.sh <commit_hash>    # 특정 커밋으로 롤백
./scripts/rollback.sh --last-stable    # 마지막 안정 버전으로 롤백

# 🔧 환경 변수 관리
./scripts/setup-env.sh --interactive   # 대화형 환경 변수 설정
./scripts/setup-env.sh --template      # 환경 변수 템플릿 생성
./scripts/setup-env.sh --verify        # 환경 변수 확인

# 📊 상태 확인
./scripts/health-check.sh              # 전체 시스템 상태 확인
railway logs                           # Railway 백엔드 로그
vercel logs                            # Vercel 프론트엔드 로그
```

### 필수 환경 변수

```bash
# 데이터베이스
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/edutech"

# AI 서비스
OPENAI_API_KEY="sk-proj-your-openai-api-key"

# 서버 설정
NODE_ENV="production"
PORT="3000"

# 보안
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# CORS
CORS_ORIGIN="https://yuriaichatbot-frontend.vercel.app"
FRONTEND_URL="https://yuriaichatbot-frontend.vercel.app"

# QR 코드
QR_BASE_URL="https://yuriaichatbot-frontend.vercel.app"
```

---

## 💻 개발 환경 설정

### 로컬 개발 환경

```bash
# 필수 도구 설치
npm install -g @railway/cli vercel

# 프로젝트 클론
git clone https://github.com/jjhmonolith/yuriaichatbot.git
cd yuriaichatbot

# 환경 변수 설정
./scripts/setup-env.sh --interactive

# 백엔드 개발 서버 실행
cd backend
npm install
npm run dev

# 프론트엔드 개발 서버 실행 (새 터미널)
cd frontend
npm install
npm run dev
```

### 개발 환경 URL

- **프론트엔드**: http://localhost:3000
- **백엔드**: http://localhost:5001
- **API 문서**: http://localhost:5001/api/health

---

## 📖 API 문서

### 핵심 엔드포인트

```bash
# 헬스체크
GET /api/health

# 관리자 API
GET /api/admin/textbooks              # 교재 목록
GET /api/admin/passage-sets           # 지문세트 목록
GET /api/admin/questions              # 문제 목록
GET /api/admin/system-prompts         # 시스템 프롬프트 목록

# 채팅 API
POST /api/chat/:qrCode               # QR 코드 기반 채팅
```

### API 사용 예시

```javascript
// 교재 목록 조회
const textbooks = await fetch('/api/admin/textbooks');

// 채팅 메시지 전송
const response = await fetch('/api/chat/ABC123', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: '이 지문의 주제는 무엇인가요?' })
});
```

---

## 🔧 문제 해결

### 일반적인 문제

#### 1. 배포 실패
```bash
# 상태 확인
./scripts/health-check.sh

# 로그 확인
railway logs
vercel logs

# 환경 변수 확인
./scripts/setup-env.sh --verify
```

#### 2. 백엔드 접속 불가
```bash
# Railway 서비스 재시작
railway service restart

# 환경 변수 재설정
./scripts/setup-env.sh --sync-railway

# 재배포
railway up
```

#### 3. 프론트엔드 빌드 오류
```bash
# 의존성 재설치
cd frontend
rm -rf node_modules package-lock.json
npm install

# 빌드 테스트
npm run build

# 재배포
vercel --prod
```

#### 4. 데이터베이스 연결 오류
```bash
# MongoDB Atlas 연결 확인
mongosh "mongodb+srv://your-connection-string"

# 네트워크 액세스 확인 (MongoDB Atlas)
# 0.0.0.0/0 허용 여부 확인

# 환경 변수 확인
echo $MONGODB_URI
```

### 롤백 절차

```bash
# 최근 커밋 확인
./scripts/rollback.sh --show-commits

# 특정 커밋으로 롤백
./scripts/rollback.sh 28d33a1

# 마지막 안정 버전으로 롤백
./scripts/rollback.sh --last-stable

# 롤백 후 상태 확인
./scripts/health-check.sh
```

---

## 🏗️ 프로젝트 구조

```
edutech-chatbot/
├── 📁 frontend/              # Next.js 프론트엔드
│   ├── src/app/              # Next.js 13+ App Router
│   ├── src/components/       # React 컴포넌트
│   ├── src/hooks/           # 커스텀 훅
│   ├── src/lib/             # 유틸리티 함수
│   └── src/types/           # TypeScript 타입
├── 📁 backend/               # Node.js 백엔드
│   ├── src/controllers/     # 비즈니스 로직
│   ├── src/models/          # MongoDB 스키마
│   ├── src/routes/          # API 라우트
│   ├── src/services/        # 외부 서비스
│   └── src/utils/           # 유틸리티
├── 📁 docs/                 # 문서
│   └── DEPLOYMENT_GUIDE.md  # 배포 가이드
├── 📁 scripts/              # 자동화 스크립트
│   ├── deploy.sh           # 배포 스크립트
│   ├── health-check.sh     # 상태 확인
│   ├── rollback.sh         # 롤백 스크립트
│   └── setup-env.sh        # 환경 변수 설정
└── 📄 README.md            # 이 파일
```

---

## 🌍 배포 환경

### 프로덕션 환경

- **🌐 프론트엔드**: https://yuriaichatbot-frontend.vercel.app
- **⚙️ 백엔드**: https://yuriaichatbot-production-1f9d.up.railway.app
- **📊 API 헬스체크**: https://yuriaichatbot-production-1f9d.up.railway.app/api/health
- **👑 관리자 페이지**: https://yuriaichatbot-frontend.vercel.app/admin

### 모니터링

- **Vercel Analytics**: 프론트엔드 성능 모니터링
- **Railway Metrics**: 백엔드 성능 모니터링
- **MongoDB Atlas Monitoring**: 데이터베이스 모니터링

---

## 🤝 기여하기

### 개발 워크플로우

1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/yuriaichatbot.git
   cd yuriaichatbot
   ```

2. **브랜치 생성**
   ```bash
   git checkout -b feature/new-feature
   ```

3. **개발 환경 설정**
   ```bash
   ./scripts/setup-env.sh --interactive
   ```

4. **로컬 개발 서버 실행**
   ```bash
   # 백엔드
   cd backend && npm run dev
   
   # 프론트엔드
   cd frontend && npm run dev
   ```

5. **테스트 및 빌드**
   ```bash
   # 백엔드 빌드
   cd backend && npm run build
   
   # 프론트엔드 빌드
   cd frontend && npm run build
   ```

6. **커밋 및 푸시**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

7. **Pull Request 생성**

### 코드 스타일

- **TypeScript**: strict 모드 사용
- **ESLint**: 프로젝트 설정 따름
- **Prettier**: 코드 포맷팅
- **Conventional Commits**: 커밋 메시지 규칙

### 버그 리포트

이슈를 발견하셨나요? [GitHub Issues](https://github.com/jjhmonolith/yuriaichatbot/issues)에 버그 리포트를 남겨주세요.

---

## 📞 지원 및 문의

- **GitHub Issues**: https://github.com/jjhmonolith/yuriaichatbot/issues
- **Documentation**: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
- **Health Check**: [scripts/health-check.sh](scripts/health-check.sh)

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## 🎉 감사의 말

이 프로젝트는 다음 기술들로 구현되었습니다:

- **Next.js** - React 기반 풀스택 프레임워크
- **Express.js** - Node.js 웹 프레임워크
- **MongoDB** - NoSQL 데이터베이스
- **OpenAI** - AI 언어 모델
- **Vercel** - 프론트엔드 배포 플랫폼
- **Railway** - 백엔드 배포 플랫폼

---

*마지막 업데이트: 2025-07-15*  
*버전: 1.0.0*  
*작성자: AI Assistant*