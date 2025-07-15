# 🚀 EduTech ChatBot 배포 가이드

> **목적**: 이 문서는 AI 어시스턴트가 독립적으로 EduTech ChatBot 서비스를 배포할 수 있도록 작성된 완전한 가이드입니다.

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [배포 아키텍처](#2-배포-아키텍처)
3. [사전 요구사항](#3-사전-요구사항)
4. [프론트엔드 배포 (Vercel)](#4-프론트엔드-배포-vercel)
5. [백엔드 배포 (Railway)](#5-백엔드-배포-railway)
6. [환경 변수 설정](#6-환경-변수-설정)
7. [배포 프로세스](#7-배포-프로세스)
8. [문제 해결](#8-문제-해결)
9. [모니터링 및 유지보수](#9-모니터링-및-유지보수)
10. [자동화 스크립트](#10-자동화-스크립트)

---

## 1. 프로젝트 개요

### 1.1 서비스 구성
- **프론트엔드**: Next.js 15 + TypeScript + Tailwind CSS
- **백엔드**: Node.js + Express + TypeScript + MongoDB
- **데이터베이스**: MongoDB Atlas (클라우드)
- **AI 서비스**: OpenAI GPT API
- **배포 플랫폼**: Vercel (프론트엔드) + Railway (백엔드)

### 1.2 핵심 기능
- QR 코드 기반 교육 콘텐츠 접근
- AI 기반 학습 도우미 챗봇
- 관리자 대시보드 (교재, 지문, 문제 관리)
- 자동 AI 해설 생성

### 1.3 프로젝트 구조
```
edutech-chatbot/
├── frontend/           # Next.js 앱
├── backend/            # Node.js 서버
├── docs/              # 문서
├── vercel.json        # Vercel 설정
└── README.md
```

---

## 2. 배포 아키텍처

### 2.1 배포 환경 구성도
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   사용자 브라우저   │ -> │  Vercel (Next.js) │ -> │ Railway (Node.js)│
│                │    │   프론트엔드        │    │     백엔드        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        |
                                                        v
                                              ┌─────────────────┐
                                              │ MongoDB Atlas   │
                                              │    데이터베이스    │
                                              └─────────────────┘
```

### 2.2 도메인 구조
- **프론트엔드**: `https://yuriaichatbot-frontend.vercel.app`
- **백엔드**: `https://yuriaichatbot-production-1f9d.up.railway.app`
- **API 엔드포인트**: `https://yuriaichatbot-production-1f9d.up.railway.app/api`

### 2.3 환경 분리
- **개발 환경**: 로컬 (localhost:3000 + localhost:5001)
- **스테이징 환경**: Vercel 미리보기 배포
- **프로덕션 환경**: Vercel + Railway

---

## 3. 사전 요구사항

### 3.1 필수 계정
- **GitHub 계정**: 소스 코드 관리
- **Vercel 계정**: 프론트엔드 배포
- **Railway 계정**: 백엔드 배포
- **MongoDB Atlas 계정**: 데이터베이스
- **OpenAI 계정**: AI API 사용

### 3.2 필수 도구
- **Node.js**: 18.x 이상
- **npm**: 최신 버전
- **Git**: 버전 관리
- **Vercel CLI**: 배포 자동화
- **Railway CLI**: 백엔드 배포 관리

### 3.3 CLI 도구 설치
```bash
# Vercel CLI 설치
npm install -g vercel

# Railway CLI 설치
npm install -g @railway/cli
```

---

## 4. 프론트엔드 배포 (Vercel)

### 4.1 Vercel 프로젝트 설정

#### 4.1.1 CLI를 통한 설정
```bash
# 프로젝트 루트에서 실행
cd frontend
vercel

# 또는 프로덕션 배포
vercel --prod
```

#### 4.1.2 GitHub 연동 설정
1. **Vercel 대시보드 접속**: https://vercel.com/dashboard
2. **Import Git Repository** 클릭
3. **GitHub 저장소 선택**: `jjhmonolith/yuriaichatbot`
4. **Root Directory 설정**: `frontend`
5. **Build Settings 확인**:
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 4.2 환경 변수 설정

#### 4.2.1 Vercel 대시보드에서 설정
```env
# API 연결
NEXT_PUBLIC_API_URL=https://yuriaichatbot-production-1f9d.up.railway.app/api

# 환경 구분
NODE_ENV=production
```

#### 4.2.2 설정 방법
1. **Vercel 프로젝트 대시보드** → **Settings** → **Environment Variables**
2. **변수 추가**: Name, Value, Environment 선택
3. **환경 선택**: Production, Preview, Development

### 4.3 도메인 설정

#### 4.3.1 기본 도메인
- **자동 생성**: `https://yuriaichatbot-frontend.vercel.app`
- **미리보기**: `https://yuriaichatbot-frontend-git-main-username.vercel.app`

#### 4.3.2 커스텀 도메인 (선택사항)
1. **Vercel 대시보드** → **Settings** → **Domains**
2. **Add Domain** 클릭
3. **DNS 레코드 추가**: A 또는 CNAME 레코드 설정

### 4.4 빌드 설정

#### 4.4.1 vercel.json 설정
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["icn1"]
}
```

#### 4.4.2 Next.js 설정 (next.config.ts)
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ];
  }
};

export default nextConfig;
```

---

## 5. 백엔드 배포 (Railway)

### 5.1 Railway 프로젝트 설정

#### 5.1.1 GitHub 연동을 통한 배포
1. **Railway 대시보드 접속**: https://railway.app/dashboard
2. **New Project** → **Deploy from GitHub repo**
3. **저장소 선택**: `jjhmonolith/yuriaichatbot`
4. **Root Directory 설정**: `backend`
5. **Service Name**: `edutech-backend`

#### 5.1.2 CLI를 통한 배포
```bash
# Railway 로그인
railway login

# 프로젝트 연결
cd backend
railway link

# 배포 실행
railway up
```

### 5.2 빌드 설정

#### 5.2.1 railway.toml 생성
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[env]
NODE_ENV = "production"
```

#### 5.2.2 package.json 스크립트 확인
```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "npm run build && node dist/app.js",
    "postinstall": "npm run build"
  }
}
```

#### 5.2.3 Dockerfile (선택사항)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]
```

### 5.3 환경 변수 설정

#### 5.3.1 Railway 대시보드에서 설정
1. **Railway 프로젝트** → **Variables** 탭
2. **필수 환경 변수 추가**:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edutech

# AI API
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yuriaichatbot-frontend.vercel.app
FRONTEND_URL=https://yuriaichatbot-frontend.vercel.app

# QR Code
QR_BASE_URL=https://yuriaichatbot-frontend.vercel.app
```

#### 5.3.2 CLI를 통한 환경 변수 설정
```bash
# 환경 변수 추가
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set OPENAI_API_KEY="sk-proj-..."
railway variables set NODE_ENV="production"
railway variables set PORT="3000"
railway variables set CORS_ORIGIN="https://yuriaichatbot-frontend.vercel.app"
```

### 5.4 도메인 및 네트워킹

#### 5.4.1 Railway 도메인
- **자동 생성**: `https://yuriaichatbot-production-1f9d.up.railway.app`
- **커스텀 도메인**: Railway 대시보드 → Settings → Domains

#### 5.4.2 헬스체크 엔드포인트
```typescript
// src/app.ts 또는 src/routes/index.ts
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Edutech Backend Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
```

---

## 6. 환경 변수 설정

### 6.1 백엔드 환경 변수

#### 6.1.1 필수 환경 변수
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edutech

# AI API
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Server
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# CORS
CORS_ORIGIN=https://yuriaichatbot-frontend.vercel.app
FRONTEND_URL=https://yuriaichatbot-frontend.vercel.app

# QR Code
QR_BASE_URL=https://yuriaichatbot-frontend.vercel.app
```

#### 6.1.2 선택적 환경 변수
```env
# 데이터베이스 연결 설정
DB_MAX_POOL_SIZE=10
DB_CONNECT_TIMEOUT=30000

# 로깅
LOG_LEVEL=info

# 캐싱
REDIS_URL=redis://localhost:6379
```

### 6.2 프론트엔드 환경 변수

#### 6.2.1 필수 환경 변수
```env
# API 연결
NEXT_PUBLIC_API_URL=https://yuriaichatbot-production-1f9d.up.railway.app/api

# 환경 구분
NODE_ENV=production
```

#### 6.2.2 선택적 환경 변수
```env
# 분석 도구
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# 오류 추적
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### 6.3 MongoDB Atlas 설정

#### 6.3.1 데이터베이스 설정
1. **MongoDB Atlas 클러스터 생성**
2. **Network Access 설정**: 0.0.0.0/0 (모든 IP 허용)
3. **Database User 생성**: 읽기/쓰기 권한
4. **Connection String 생성**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/edutech?retryWrites=true&w=majority
   ```

#### 6.3.2 인덱스 설정
```javascript
// 권장 인덱스 설정
db.passagesets.createIndex({ "qrCode": 1 }, { unique: true });
db.questions.createIndex({ "setId": 1, "questionNumber": 1 });
db.systemprompts.createIndex({ "key": 1 }, { unique: true });
```

---

## 7. 배포 프로세스

### 7.1 자동 배포 플로우

#### 7.1.1 GitHub 푸시 기반 배포
```mermaid
graph TD
    A[코드 푸시] --> B[GitHub Repository]
    B --> C[Vercel 자동 빌드]
    B --> D[Railway 자동 빌드]
    C --> E[프론트엔드 배포]
    D --> F[백엔드 배포]
    E --> G[배포 완료]
    F --> G
```

#### 7.1.2 배포 트리거 조건
- **main 브랜치 푸시**: 프로덕션 배포
- **feature 브랜치 푸시**: 미리보기 배포 (Vercel)
- **Pull Request**: 미리보기 배포 생성

### 7.2 수동 배포 프로세스

#### 7.2.1 프론트엔드 수동 배포
```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 로컬 빌드 테스트
npm run build

# Vercel 배포
vercel --prod
```

#### 7.2.2 백엔드 수동 배포
```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
npm install

# TypeScript 빌드
npm run build

# Railway 배포
railway up
```

### 7.3 배포 검증

#### 7.3.1 프론트엔드 검증
```bash
# 배포 상태 확인
curl -I https://yuriaichatbot-frontend.vercel.app

# 페이지 로드 테스트
curl https://yuriaichatbot-frontend.vercel.app
```

#### 7.3.2 백엔드 검증
```bash
# 헬스체크 엔드포인트 확인
curl https://yuriaichatbot-production-1f9d.up.railway.app/api/health

# API 테스트
curl -X GET https://yuriaichatbot-production-1f9d.up.railway.app/api/admin/textbooks
```

---

## 8. 문제 해결

### 8.1 일반적인 배포 문제

#### 8.1.1 빌드 실패
**증상**: 빌드 과정에서 오류 발생
**해결방법**:
```bash
# 로컬에서 빌드 테스트
npm run build

# 의존성 캐시 삭제
npm ci

# TypeScript 오류 확인
npm run type-check
```

#### 8.1.2 환경 변수 오류
**증상**: 환경 변수 접근 실패
**해결방법**:
1. **변수 이름 확인**: 대소문자 구분
2. **플랫폼별 설정 확인**: Vercel/Railway 대시보드
3. **리빌드 실행**: 환경 변수 변경 후 재배포

#### 8.1.3 CORS 오류
**증상**: 프론트엔드-백엔드 통신 실패
**해결방법**:
```typescript
// backend/src/app.ts
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://yuriaichatbot-frontend.vercel.app']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### 8.2 Railway 관련 문제

#### 8.2.1 서버 접속 불가
**증상**: 404 또는 500 오류
**해결방법**:
```bash
# Railway 로그 확인
railway logs

# 서비스 재시작
railway service restart

# 환경 변수 확인
railway variables
```

#### 8.2.2 메모리 부족
**증상**: 서버 재시작 반복
**해결방법**:
1. **Railway 대시보드** → **Settings** → **Resources**
2. **메모리 한도 증가**: 512MB → 1GB
3. **코드 최적화**: 메모리 사용량 최소화

### 8.3 Vercel 관련 문제

#### 8.3.1 함수 타임아웃
**증상**: 서버리스 함수 실행 시간 초과
**해결방법**:
```json
// vercel.json
{
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

#### 8.3.2 이미지 최적화 오류
**증상**: 이미지 로드 실패
**해결방법**:
```javascript
// next.config.js
const nextConfig = {
  images: {
    domains: ['your-domain.com'],
    unoptimized: true
  }
};
```

---

## 9. 모니터링 및 유지보수

### 9.1 로그 모니터링

#### 9.1.1 Railway 로그
```bash
# 실시간 로그 확인
railway logs --follow

# 특정 서비스 로그
railway logs --service edutech-backend
```

#### 9.1.2 Vercel 로그
```bash
# 함수 로그 확인
vercel logs https://yuriaichatbot-frontend.vercel.app

# 실시간 로그
vercel logs --follow
```

### 9.2 성능 모니터링

#### 9.2.1 업타임 모니터링
```bash
# 헬스체크 스크립트
#!/bin/bash
BACKEND_URL="https://yuriaichatbot-production-1f9d.up.railway.app/api/health"
FRONTEND_URL="https://yuriaichatbot-frontend.vercel.app"

# 백엔드 상태 확인
if curl -f $BACKEND_URL > /dev/null 2>&1; then
  echo "✅ Backend is healthy"
else
  echo "❌ Backend is down"
fi

# 프론트엔드 상태 확인
if curl -f $FRONTEND_URL > /dev/null 2>&1; then
  echo "✅ Frontend is healthy"
else
  echo "❌ Frontend is down"
fi
```

#### 9.2.2 성능 메트릭
- **응답 시간**: < 2초
- **가동률**: > 99.5%
- **메모리 사용률**: < 80%
- **CPU 사용률**: < 70%

### 9.3 백업 및 복구

#### 9.3.1 데이터베이스 백업
```bash
# MongoDB 백업
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/edutech" --out=backup/

# 백업 복구
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/edutech" backup/edutech/
```

#### 9.3.2 코드 백업
```bash
# Git 백업
git clone https://github.com/jjhmonolith/yuriaichatbot.git backup/

# 특정 시점 복구
git reset --hard COMMIT_HASH
```

---

## 10. 자동화 스크립트

### 10.1 배포 자동화 스크립트

#### 10.1.1 전체 배포 스크립트
```bash
#!/bin/bash
# deploy.sh

echo "🚀 EduTech ChatBot 배포 시작"

# 환경 확인
if [ -z "$MONGODB_URI" ]; then
  echo "❌ MONGODB_URI 환경 변수가 설정되지 않았습니다"
  exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ OPENAI_API_KEY 환경 변수가 설정되지 않았습니다"
  exit 1
fi

# 백엔드 빌드 및 배포
echo "📦 백엔드 빌드 중..."
cd backend
npm install
npm run build
railway up

# 프론트엔드 빌드 및 배포
echo "🌐 프론트엔드 배포 중..."
cd ../frontend
npm install
npm run build
vercel --prod

echo "✅ 배포 완료!"
```

#### 10.1.2 롤백 스크립트
```bash
#!/bin/bash
# rollback.sh

COMMIT_HASH=$1

if [ -z "$COMMIT_HASH" ]; then
  echo "사용법: ./rollback.sh <commit_hash>"
  exit 1
fi

echo "🔄 롤백 시작: $COMMIT_HASH"

# Git 롤백
git reset --hard $COMMIT_HASH
git push -f origin main

echo "✅ 롤백 완료!"
```

### 10.2 상태 확인 스크립트

#### 10.2.1 헬스체크 스크립트
```bash
#!/bin/bash
# health-check.sh

BACKEND_URL="https://yuriaichatbot-production-1f9d.up.railway.app/api/health"
FRONTEND_URL="https://yuriaichatbot-frontend.vercel.app"

echo "🔍 시스템 상태 확인 중..."

# 백엔드 상태 확인
echo "백엔드 상태 확인..."
if curl -f $BACKEND_URL > /dev/null 2>&1; then
  echo "✅ 백엔드: 정상"
else
  echo "❌ 백엔드: 오류"
  exit 1
fi

# 프론트엔드 상태 확인
echo "프론트엔드 상태 확인..."
if curl -f $FRONTEND_URL > /dev/null 2>&1; then
  echo "✅ 프론트엔드: 정상"
else
  echo "❌ 프론트엔드: 오류"
  exit 1
fi

echo "✅ 모든 시스템 정상 작동 중"
```

### 10.3 환경 변수 관리 스크립트

#### 10.3.1 환경 변수 설정 스크립트
```bash
#!/bin/bash
# setup-env.sh

echo "🔧 환경 변수 설정 중..."

# Railway 환경 변수 설정
railway variables set MONGODB_URI="$MONGODB_URI"
railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"
railway variables set CORS_ORIGIN="https://yuriaichatbot-frontend.vercel.app"
railway variables set FRONTEND_URL="https://yuriaichatbot-frontend.vercel.app"
railway variables set QR_BASE_URL="https://yuriaichatbot-frontend.vercel.app"

echo "✅ Railway 환경 변수 설정 완료"

# Vercel 환경 변수 설정 (수동으로 Vercel 대시보드에서 설정 필요)
echo "📝 Vercel 환경 변수 설정이 필요합니다:"
echo "   NEXT_PUBLIC_API_URL=https://yuriaichatbot-production-1f9d.up.railway.app/api"
echo "   NODE_ENV=production"
```

---

## 📚 참고 자료

### 관련 문서
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel 배포 문서](https://vercel.com/docs)
- [Railway 배포 문서](https://docs.railway.app/)
- [MongoDB Atlas 설정](https://docs.atlas.mongodb.com/)

### 유용한 명령어
```bash
# 로컬 개발 환경 실행
npm run dev

# 프로덕션 빌드
npm run build

# 환경 변수 확인
printenv | grep -E "(MONGODB|OPENAI|NODE_ENV)"

# 포트 사용 확인
lsof -i :3000
lsof -i :5001
```

### 문제 해결 체크리스트
- [ ] 환경 변수 설정 확인
- [ ] 빌드 오류 해결
- [ ] 네트워크 연결 확인
- [ ] CORS 설정 확인
- [ ] 데이터베이스 연결 확인
- [ ] API 엔드포인트 테스트
- [ ] 로그 확인
- [ ] 배포 상태 확인

---

## 🎯 결론

이 가이드를 따라 EduTech ChatBot 서비스를 성공적으로 배포할 수 있습니다. 모든 단계를 순서대로 실행하고, 문제가 발생하면 문제 해결 섹션을 참고하세요.

**배포 완료 후 확인사항:**
1. ✅ 프론트엔드 정상 접속
2. ✅ 백엔드 API 정상 응답
3. ✅ 데이터베이스 연결 확인
4. ✅ AI 기능 정상 작동

**지속적인 운영을 위한 권장사항:**
- 정기적인 백업 수행
- 성능 모니터링 설정
- 보안 업데이트 적용
- 로그 모니터링 구축

---

*작성일: 2025-07-15*  
*작성자: AI Assistant*  
*버전: 1.0*