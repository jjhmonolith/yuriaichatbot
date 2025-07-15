# 🚀 EduTech ChatBot 빠른 시작 가이드

> 다른 AI 어시스턴트가 이 프로젝트를 독립적으로 배포할 수 있도록 작성된 단계별 가이드입니다.

## 📋 목차

1. [사전 준비](#1-사전-준비)
2. [프로젝트 설정](#2-프로젝트-설정)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [배포 실행](#4-배포-실행)
5. [배포 확인](#5-배포-확인)
6. [문제 해결](#6-문제-해결)

---

## 1. 사전 준비

### 필수 계정 생성

다음 플랫폼에서 계정을 생성하고 필요한 정보를 수집하세요:

#### 🔑 MongoDB Atlas
1. https://www.mongodb.com/cloud/atlas 회원가입
2. 새 클러스터 생성 (무료 M0 클러스터)
3. Database Access → Add New Database User (읽기/쓰기 권한)
4. Network Access → Add IP Address (0.0.0.0/0 허용)
5. 연결 문자열 복사: `mongodb+srv://username:password@cluster.mongodb.net/edutech`

#### 🤖 OpenAI
1. https://platform.openai.com/ 회원가입
2. API Keys → Create new secret key
3. API 키 복사: `sk-proj-...`

#### 🌐 Vercel
1. https://vercel.com/ 회원가입
2. GitHub 계정 연결

#### 🚂 Railway
1. https://railway.app/ 회원가입
2. GitHub 계정 연결

### 필수 도구 설치

```bash
# Node.js 18+ 설치 확인
node --version

# CLI 도구 설치
npm install -g @railway/cli vercel

# Git 설치 확인
git --version
```

---

## 2. 프로젝트 설정

### 저장소 클론

```bash
# 프로젝트 클론
git clone https://github.com/jjhmonolith/yuriaichatbot.git
cd yuriaichatbot

# 스크립트 실행 권한 부여
chmod +x scripts/*.sh

# 프로젝트 구조 확인
ls -la
```

### 계정 로그인

```bash
# Railway 로그인
railway login

# Vercel 로그인
vercel login
```

---

## 3. 환경 변수 설정

### 방법 1: 대화형 설정 (권장)

```bash
# 대화형 환경 변수 설정
./scripts/setup-env.sh --interactive
```

프롬프트에 따라 다음 정보를 입력하세요:
- MongoDB 연결 문자열
- OpenAI API 키
- 서버 설정 (기본값 사용 가능)
- JWT 시크릿 키
- 프론트엔드 URL
- QR 코드 베이스 URL

### 방법 2: 템플릿 사용

```bash
# 환경 변수 템플릿 생성
./scripts/setup-env.sh --template

# 템플릿 복사 후 편집
cp .env.template .env
nano .env

# 환경 변수 로드
source .env
```

### 환경 변수 확인

```bash
# 설정된 환경 변수 확인
./scripts/setup-env.sh --verify
```

---

## 4. 배포 실행

### 자동 배포 (권장)

```bash
# 전체 배포 스크립트 실행
./scripts/deploy.sh
```

이 스크립트는 다음을 자동으로 실행합니다:
1. 필수 도구 설치 확인
2. 환경 변수 검증
3. Git 상태 확인
4. 백엔드 빌드 및 Railway 배포
5. 프론트엔드 빌드 및 Vercel 배포
6. 배포 상태 확인

### 수동 배포

#### 백엔드 배포

```bash
cd backend

# 의존성 설치
npm install

# TypeScript 빌드
npm run build

# Railway 환경 변수 설정
railway variables set MONGODB_URI="$MONGODB_URI"
railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"
railway variables set CORS_ORIGIN="https://yuriaichatbot-frontend.vercel.app"
railway variables set FRONTEND_URL="https://yuriaichatbot-frontend.vercel.app"
railway variables set QR_BASE_URL="https://yuriaichatbot-frontend.vercel.app"

# Railway 배포
railway up

cd ..
```

#### 프론트엔드 배포

```bash
cd frontend

# 의존성 설치
npm install

# Next.js 빌드
npm run build

# Vercel 배포
vercel --prod

cd ..
```

---

## 5. 배포 확인

### 자동 상태 확인

```bash
# 전체 시스템 상태 확인
./scripts/health-check.sh
```

### 수동 확인

#### 백엔드 상태 확인

```bash
# 헬스체크 엔드포인트 확인
curl https://yuriaichatbot-production-1f9d.up.railway.app/api/health

# Railway 로그 확인
railway logs
```

#### 프론트엔드 상태 확인

```bash
# 프론트엔드 접속 확인
curl https://yuriaichatbot-frontend.vercel.app

# Vercel 로그 확인
vercel logs
```

### 예상 결과

✅ **성공적인 배포 상태:**
- 🌐 프론트엔드: https://yuriaichatbot-frontend.vercel.app (200 OK)
- ⚙️ 백엔드: https://yuriaichatbot-production-1f9d.up.railway.app (200 OK)
- 📊 헬스체크: `{"status":"OK","message":"Edutech Backend Server is running"}`

---

## 6. 문제 해결

### 일반적인 문제와 해결방법

#### 1. 환경 변수 오류

**증상:** `MONGODB_URI 환경 변수가 설정되지 않았습니다`

**해결:**
```bash
# 환경 변수 재설정
./scripts/setup-env.sh --interactive

# 환경 변수 확인
./scripts/setup-env.sh --verify
```

#### 2. Railway 배포 실패

**증상:** `Unauthorized. Please login with railway login`

**해결:**
```bash
# Railway 재로그인
railway login

# 프로젝트 재연결
railway link

# 재배포
railway up
```

#### 3. Vercel 배포 실패

**증상:** 빌드 오류 또는 배포 실패

**해결:**
```bash
cd frontend

# 캐시 클리어
rm -rf .next node_modules package-lock.json

# 재설치 및 빌드
npm install
npm run build

# 재배포
vercel --prod
```

#### 4. 백엔드 접속 불가

**증상:** 404 또는 500 오류

**해결:**
```bash
# Railway 로그 확인
railway logs

# 환경 변수 확인
railway variables

# 서비스 재시작
railway service restart
```

#### 5. 데이터베이스 연결 실패

**증상:** MongoDB 연결 오류

**해결:**
```bash
# MongoDB Atlas 설정 확인
# 1. 네트워크 액세스: 0.0.0.0/0 허용
# 2. 데이터베이스 사용자 권한 확인
# 3. 연결 문자열 형식 확인

# 연결 테스트
mongosh "$MONGODB_URI"
```

### 롤백 절차

배포에 문제가 있으면 안정 버전으로 롤백할 수 있습니다:

```bash
# 최근 커밋 확인
./scripts/rollback.sh --show-commits

# 특정 커밋으로 롤백
./scripts/rollback.sh 28d33a1

# 마지막 안정 버전으로 롤백
./scripts/rollback.sh --last-stable
```

---

## 🎯 성공적인 배포 완료!

배포가 성공하면 다음과 같은 서비스에 접근할 수 있습니다:

### 🌐 서비스 URL
- **프론트엔드**: https://yuriaichatbot-frontend.vercel.app
- **백엔드**: https://yuriaichatbot-production-1f9d.up.railway.app
- **관리자 페이지**: https://yuriaichatbot-frontend.vercel.app/admin
- **API 문서**: https://yuriaichatbot-production-1f9d.up.railway.app/api/health

### 🧪 기능 테스트
1. **관리자 페이지 접속** → 교재 생성 → 지문세트 생성 → 문제 생성
2. **QR 코드 생성** → 학생 채팅 페이지 접속 → AI 대화 테스트
3. **AI 해설 생성** → 자동 해설 생성 기능 테스트

### 📊 모니터링
- **상태 확인**: `./scripts/health-check.sh`
- **로그 확인**: `railway logs` (백엔드), `vercel logs` (프론트엔드)
- **성능 모니터링**: Vercel Analytics, Railway Metrics

---

## 📚 추가 자료

더 자세한 정보는 다음 문서를 참고하세요:

- **📖 완전한 배포 가이드**: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
- **📄 프로젝트 README**: [README.md](README.md)
- **🔧 문제 해결 스크립트**: [scripts/health-check.sh](scripts/health-check.sh)

---

**🎉 축하합니다! EduTech ChatBot 서비스가 성공적으로 배포되었습니다.**

*작성일: 2025-07-15*  
*버전: 1.0*  
*대상: AI 어시스턴트 독립 배포*