#!/bin/bash
# EduTech ChatBot 자동 배포 스크립트
# 작성일: 2025-07-15
# 버전: 1.0

set -e  # 오류 발생 시 스크립트 종료

# 색상 코드 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 스크립트 시작
echo "🚀 EduTech ChatBot 자동 배포 스크립트 시작"
echo "=================================================="

# 현재 디렉토리 확인
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    log_error "프로젝트 루트 디렉토리에서 실행해주세요"
    exit 1
fi

# 1. 필수 도구 설치 확인
log_info "필수 도구 설치 확인 중..."

# Node.js 확인
if ! command -v node &> /dev/null; then
    log_error "Node.js가 설치되지 않았습니다"
    exit 1
fi

# npm 확인
if ! command -v npm &> /dev/null; then
    log_error "npm이 설치되지 않았습니다"
    exit 1
fi

# Git 확인
if ! command -v git &> /dev/null; then
    log_error "Git이 설치되지 않았습니다"
    exit 1
fi

# Vercel CLI 확인 및 설치
if ! command -v vercel &> /dev/null; then
    log_warning "Vercel CLI가 설치되지 않았습니다. 설치 중..."
    npm install -g vercel
fi

# Railway CLI 확인 및 설치
if ! command -v railway &> /dev/null; then
    log_warning "Railway CLI가 설치되지 않았습니다. 설치 중..."
    npm install -g @railway/cli
fi

log_success "필수 도구 설치 확인 완료"

# 2. 환경 변수 확인
log_info "환경 변수 확인 중..."

# 중요 환경 변수 확인
if [ -z "$MONGODB_URI" ]; then
    log_error "MONGODB_URI 환경 변수가 설정되지 않았습니다"
    log_info "export MONGODB_URI='mongodb+srv://username:password@cluster.mongodb.net/edutech' 형태로 설정해주세요"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    log_error "OPENAI_API_KEY 환경 변수가 설정되지 않았습니다"
    log_info "export OPENAI_API_KEY='sk-proj-...' 형태로 설정해주세요"
    exit 1
fi

log_success "환경 변수 확인 완료"

# 3. Git 상태 확인
log_info "Git 상태 확인 중..."

# 변경사항 확인
if [ -n "$(git status --porcelain)" ]; then
    log_warning "커밋되지 않은 변경사항이 있습니다. 커밋하시겠습니까? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        git add .
        git commit -m "Automated deployment commit $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin main
    else
        log_info "변경사항을 커밋하지 않고 계속 진행합니다"
    fi
fi

log_success "Git 상태 확인 완료"

# 4. 백엔드 배포
log_info "백엔드 배포 시작..."

cd backend

# 의존성 설치
log_info "백엔드 의존성 설치 중..."
npm install

# TypeScript 빌드
log_info "TypeScript 빌드 중..."
npm run build

# Railway 배포 설정 파일 생성
if [ ! -f "railway.toml" ]; then
    log_info "railway.toml 파일 생성 중..."
    cat > railway.toml << EOF
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
EOF
fi

# Railway 로그인 확인
if ! railway whoami &> /dev/null; then
    log_error "Railway에 로그인되지 않았습니다"
    log_info "railway login 명령어를 실행해주세요"
    exit 1
fi

# Railway 환경 변수 설정
log_info "Railway 환경 변수 설정 중..."
railway variables set MONGODB_URI="$MONGODB_URI"
railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"
railway variables set CORS_ORIGIN="https://yuriaichatbot-frontend.vercel.app"
railway variables set FRONTEND_URL="https://yuriaichatbot-frontend.vercel.app"
railway variables set QR_BASE_URL="https://yuriaichatbot-frontend.vercel.app"

# Railway 배포
log_info "Railway 배포 실행 중..."
railway up

log_success "백엔드 배포 완료"

# 5. 프론트엔드 배포
log_info "프론트엔드 배포 시작..."

cd ../frontend

# 의존성 설치
log_info "프론트엔드 의존성 설치 중..."
npm install

# 빌드 테스트
log_info "프론트엔드 빌드 테스트 중..."
npm run build

# Vercel 배포
log_info "Vercel 배포 실행 중..."
vercel --prod

log_success "프론트엔드 배포 완료"

# 6. 배포 확인
log_info "배포 상태 확인 중..."

# 백엔드 헬스체크
BACKEND_URL="https://yuriaichatbot-production-1f9d.up.railway.app/api/health"
log_info "백엔드 헬스체크: $BACKEND_URL"

# 30초 대기 후 헬스체크
sleep 30

if curl -f "$BACKEND_URL" > /dev/null 2>&1; then
    log_success "백엔드 헬스체크 성공"
else
    log_warning "백엔드 헬스체크 실패 - 몇 분 후 다시 확인해주세요"
fi

# 프론트엔드 확인
FRONTEND_URL="https://yuriaichatbot-frontend.vercel.app"
log_info "프론트엔드 확인: $FRONTEND_URL"

if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
    log_success "프론트엔드 접속 성공"
else
    log_warning "프론트엔드 접속 실패 - 몇 분 후 다시 확인해주세요"
fi

# 7. 배포 완료 메시지
echo ""
echo "=================================================="
log_success "🎉 배포 완료!"
echo "=================================================="
echo ""
echo "📋 배포 정보:"
echo "   🌐 프론트엔드: https://yuriaichatbot-frontend.vercel.app"
echo "   ⚙️  백엔드: https://yuriaichatbot-production-1f9d.up.railway.app"
echo "   📊 API 헬스체크: https://yuriaichatbot-production-1f9d.up.railway.app/api/health"
echo ""
echo "🔍 확인사항:"
echo "   1. 프론트엔드 페이지가 정상 로드되는지 확인"
echo "   2. 백엔드 API가 정상 응답하는지 확인"
echo "   3. 관리자 페이지에서 기능 테스트"
echo "   4. QR 코드 기반 채팅 기능 테스트"
echo ""
echo "📝 문제 해결:"
echo "   - 배포 실패 시: scripts/health-check.sh 실행"
echo "   - 로그 확인: railway logs (백엔드), vercel logs (프론트엔드)"
echo "   - 롤백 필요 시: scripts/rollback.sh <commit_hash>"
echo ""

# 스크립트 종료
exit 0