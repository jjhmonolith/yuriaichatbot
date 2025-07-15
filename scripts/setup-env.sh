#!/bin/bash
# EduTech ChatBot 환경 변수 설정 스크립트
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

# 도움말 표시
show_help() {
    echo "EduTech ChatBot 환경 변수 설정 스크립트"
    echo ""
    echo "사용법:"
    echo "  ./setup-env.sh --interactive         # 대화형 설정 모드"
    echo "  ./setup-env.sh --from-file <file>    # 파일에서 환경 변수 로드"
    echo "  ./setup-env.sh --template            # 환경 변수 템플릿 생성"
    echo "  ./setup-env.sh --verify              # 현재 환경 변수 확인"
    echo "  ./setup-env.sh --help                # 도움말 표시"
    echo ""
    echo "예시:"
    echo "  ./setup-env.sh --interactive         # 대화형으로 환경 변수 설정"
    echo "  ./setup-env.sh --from-file .env      # .env 파일에서 로드"
    echo "  ./setup-env.sh --template            # .env.template 생성"
}

# 환경 변수 템플릿 생성
create_template() {
    local template_file=".env.template"
    
    log_info "환경 변수 템플릿 생성 중: $template_file"
    
    cat > "$template_file" << 'EOF'
# EduTech ChatBot 환경 변수 설정
# 작성일: 2025-07-15
# 
# 사용법:
#   1. 이 파일을 .env로 복사: cp .env.template .env
#   2. 각 변수에 실제 값 입력
#   3. 환경 변수 로드: source .env
#   4. 배포 스크립트 실행: ./scripts/deploy.sh

# =============================================================================
# 데이터베이스 설정
# =============================================================================
# MongoDB Atlas 연결 문자열
# 형식: mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_URI="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/edutech?retryWrites=true&w=majority"

# 데이터베이스 연결 설정 (선택사항)
DB_MAX_POOL_SIZE=10
DB_CONNECT_TIMEOUT=30000

# =============================================================================
# AI 서비스 설정
# =============================================================================
# OpenAI API 키
# 형식: sk-proj-... (OpenAI 대시보드에서 생성)
OPENAI_API_KEY="sk-proj-your-openai-api-key-here"

# AI 모델 설정 (선택사항)
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_MAX_TOKENS=2000

# =============================================================================
# 서버 설정
# =============================================================================
# 서버 포트 (Railway에서는 자동 설정)
PORT=3000

# 실행 환경
NODE_ENV=production

# JWT 보안 키 (최소 32자리)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# =============================================================================
# CORS 및 보안 설정
# =============================================================================
# 허용할 프론트엔드 도메인
CORS_ORIGIN="https://yuriaichatbot-frontend.vercel.app"
FRONTEND_URL="https://yuriaichatbot-frontend.vercel.app"

# 추가 허용 도메인 (개발/스테이징)
CORS_ORIGIN_DEV="http://localhost:3000"

# =============================================================================
# QR 코드 설정
# =============================================================================
# QR 코드 베이스 URL
QR_BASE_URL="https://yuriaichatbot-frontend.vercel.app"

# QR 코드 생성 설정
QR_CODE_SIZE=200
QR_CODE_ERROR_CORRECTION="M"

# =============================================================================
# 로깅 설정
# =============================================================================
# 로그 레벨 (error, warn, info, debug)
LOG_LEVEL="info"

# 로그 파일 경로
LOG_FILE_PATH="./logs/app.log"

# =============================================================================
# 캐싱 설정 (선택사항)
# =============================================================================
# Redis 연결 문자열 (선택사항)
# REDIS_URL="redis://localhost:6379"

# 캐시 만료 시간 (초)
CACHE_TTL=3600

# =============================================================================
# 모니터링 설정 (선택사항)
# =============================================================================
# Sentry DSN (오류 추적)
# SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"

# Google Analytics ID
# GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# =============================================================================
# 개발 환경 설정
# =============================================================================
# 개발 환경에서만 사용
DEBUG=false
VERBOSE_LOGGING=false

# 개발 서버 설정
DEV_SERVER_HOST="localhost"
DEV_SERVER_PORT=5001

# =============================================================================
# 배포 설정
# =============================================================================
# 배포 환경 구분
DEPLOYMENT_ENV="production"

# 배포 시간 (자동 설정)
DEPLOYMENT_TIME=""

# Git 커밋 해시 (자동 설정)
GIT_COMMIT_HASH=""
EOF

    log_success "환경 변수 템플릿이 생성되었습니다: $template_file"
    log_info "다음 단계:"
    log_info "  1. 템플릿 복사: cp $template_file .env"
    log_info "  2. 환경 변수 편집: nano .env"
    log_info "  3. 환경 변수 로드: source .env"
    log_info "  4. 설정 확인: ./scripts/setup-env.sh --verify"
}

# 현재 환경 변수 확인
verify_env() {
    log_info "현재 환경 변수 확인 중..."
    
    # 필수 환경 변수 목록
    local required_vars=(
        "MONGODB_URI"
        "OPENAI_API_KEY"
        "NODE_ENV"
        "CORS_ORIGIN"
        "FRONTEND_URL"
        "QR_BASE_URL"
    )
    
    # 선택적 환경 변수 목록
    local optional_vars=(
        "PORT"
        "JWT_SECRET"
        "LOG_LEVEL"
        "CACHE_TTL"
        "SENTRY_DSN"
        "GOOGLE_ANALYTICS_ID"
    )
    
    local missing_count=0
    local total_count=${#required_vars[@]}
    
    echo ""
    echo "📋 필수 환경 변수 확인:"
    echo "----------------------------------------"
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "$var: 설정되지 않음"
            ((missing_count++))
        else
            local value="${!var}"
            # 민감한 정보는 마스킹
            if [[ "$var" == *"PASSWORD"* || "$var" == *"SECRET"* || "$var" == *"KEY"* ]]; then
                local masked_value="${value:0:8}***"
                log_success "$var: $masked_value"
            else
                log_success "$var: $value"
            fi
        fi
    done
    
    echo ""
    echo "📋 선택적 환경 변수 확인:"
    echo "----------------------------------------"
    
    for var in "${optional_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_warning "$var: 설정되지 않음 (기본값 사용)"
        else
            local value="${!var}"
            # 민감한 정보는 마스킹
            if [[ "$var" == *"PASSWORD"* || "$var" == *"SECRET"* || "$var" == *"KEY"* ]]; then
                local masked_value="${value:0:8}***"
                log_success "$var: $masked_value"
            else
                log_success "$var: $value"
            fi
        fi
    done
    
    echo ""
    echo "📊 환경 변수 상태 요약:"
    echo "----------------------------------------"
    echo "   필수 변수: $((total_count - missing_count))/$total_count 설정됨"
    
    if [ $missing_count -eq 0 ]; then
        log_success "모든 필수 환경 변수가 설정되었습니다!"
        return 0
    else
        log_error "$missing_count개의 필수 환경 변수가 설정되지 않았습니다"
        log_info "환경 변수 설정 방법:"
        log_info "  1. 템플릿 생성: ./scripts/setup-env.sh --template"
        log_info "  2. 대화형 설정: ./scripts/setup-env.sh --interactive"
        return 1
    fi
}

# 대화형 환경 변수 설정
interactive_setup() {
    log_info "대화형 환경 변수 설정을 시작합니다..."
    
    local env_file=".env"
    local temp_file=".env.tmp"
    
    # 기존 .env 파일 백업
    if [ -f "$env_file" ]; then
        log_warning "기존 .env 파일이 존재합니다. 백업을 생성합니다..."
        cp "$env_file" "$env_file.backup.$(date +%Y%m%d-%H%M%S)"
    fi
    
    # 환경 변수 설정 시작
    cat > "$temp_file" << 'EOF'
# EduTech ChatBot 환경 변수 설정
# 자동 생성됨 - 2025-07-15

EOF
    
    echo ""
    echo "📝 필수 환경 변수 설정"
    echo "========================================"
    
    # MongoDB URI 설정
    echo ""
    log_info "MongoDB 설정"
    echo "MongoDB Atlas 연결 문자열을 입력하세요:"
    echo "형식: mongodb+srv://username:password@cluster.mongodb.net/edutech"
    read -p "MONGODB_URI: " mongodb_uri
    echo "MONGODB_URI=\"$mongodb_uri\"" >> "$temp_file"
    
    # OpenAI API 키 설정
    echo ""
    log_info "OpenAI API 설정"
    echo "OpenAI API 키를 입력하세요:"
    echo "형식: sk-proj-..."
    read -p "OPENAI_API_KEY: " openai_key
    echo "OPENAI_API_KEY=\"$openai_key\"" >> "$temp_file"
    
    # 서버 설정
    echo ""
    log_info "서버 설정"
    read -p "NODE_ENV [production]: " node_env
    node_env=${node_env:-production}
    echo "NODE_ENV=\"$node_env\"" >> "$temp_file"
    
    read -p "PORT [3000]: " port
    port=${port:-3000}
    echo "PORT=\"$port\"" >> "$temp_file"
    
    # JWT 시크릿 설정
    echo ""
    log_info "보안 설정"
    echo "JWT 시크릿 키를 입력하세요 (최소 32자):"
    read -p "JWT_SECRET: " jwt_secret
    echo "JWT_SECRET=\"$jwt_secret\"" >> "$temp_file"
    
    # CORS 설정
    echo ""
    log_info "CORS 설정"
    read -p "FRONTEND_URL [https://yuriaichatbot-frontend.vercel.app]: " frontend_url
    frontend_url=${frontend_url:-https://yuriaichatbot-frontend.vercel.app}
    echo "FRONTEND_URL=\"$frontend_url\"" >> "$temp_file"
    echo "CORS_ORIGIN=\"$frontend_url\"" >> "$temp_file"
    
    # QR 코드 설정
    echo ""
    log_info "QR 코드 설정"
    read -p "QR_BASE_URL [$frontend_url]: " qr_base_url
    qr_base_url=${qr_base_url:-$frontend_url}
    echo "QR_BASE_URL=\"$qr_base_url\"" >> "$temp_file"
    
    # 추가 설정
    echo ""
    echo "# 추가 설정" >> "$temp_file"
    echo "LOG_LEVEL=\"info\"" >> "$temp_file"
    echo "CACHE_TTL=3600" >> "$temp_file"
    echo "DEPLOYMENT_TIME=\"$(date)\"" >> "$temp_file"
    echo "GIT_COMMIT_HASH=\"$(git rev-parse HEAD)\"" >> "$temp_file"
    
    # 파일 저장
    mv "$temp_file" "$env_file"
    
    log_success "환경 변수 설정이 완료되었습니다: $env_file"
    log_info "설정된 환경 변수 확인: ./scripts/setup-env.sh --verify"
}

# 파일에서 환경 변수 로드
load_from_file() {
    local file_path=$1
    
    if [ -z "$file_path" ]; then
        log_error "파일 경로가 제공되지 않았습니다"
        exit 1
    fi
    
    if [ ! -f "$file_path" ]; then
        log_error "파일을 찾을 수 없습니다: $file_path"
        exit 1
    fi
    
    log_info "환경 변수 파일 로드 중: $file_path"
    
    # 파일 내용 검증
    if grep -q "MONGODB_URI\|OPENAI_API_KEY" "$file_path"; then
        log_success "환경 변수 파일이 유효합니다"
    else
        log_error "환경 변수 파일이 유효하지 않습니다"
        exit 1
    fi
    
    # 환경 변수 로드
    set -a  # 모든 변수를 자동으로 export
    source "$file_path"
    set +a
    
    log_success "환경 변수가 로드되었습니다"
    
    # Railway 환경 변수 설정
    if command -v railway &> /dev/null; then
        log_info "Railway 환경 변수 설정 중..."
        
        # 파일에서 환경 변수 읽어서 Railway에 설정
        while IFS= read -r line; do
            # 주석과 빈 줄 제외
            if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
                continue
            fi
            
            # 환경 변수 형식 확인
            if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
                local var_name="${BASH_REMATCH[1]}"
                local var_value="${BASH_REMATCH[2]}"
                
                # 따옴표 제거
                var_value=$(echo "$var_value" | sed 's/^"\(.*\)"$/\1/')
                
                # Railway에 설정
                railway variables set "$var_name"="$var_value"
                log_success "Railway 환경 변수 설정: $var_name"
            fi
        done < "$file_path"
    else
        log_warning "Railway CLI가 설치되지 않았습니다"
    fi
    
    log_success "환경 변수 설정이 완료되었습니다"
}

# Railway 환경 변수 동기화
sync_railway_env() {
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI가 설치되지 않았습니다"
        exit 1
    fi
    
    log_info "Railway 환경 변수 동기화 중..."
    
    # 필수 환경 변수 목록
    local required_vars=(
        "MONGODB_URI"
        "OPENAI_API_KEY"
        "NODE_ENV"
        "PORT"
        "CORS_ORIGIN"
        "FRONTEND_URL"
        "QR_BASE_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -n "${!var}" ]; then
            railway variables set "$var"="${!var}"
            log_success "Railway 환경 변수 설정: $var"
        else
            log_warning "환경 변수가 설정되지 않음: $var"
        fi
    done
    
    log_success "Railway 환경 변수 동기화 완료"
}

# 메인 실행 부분
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --template)
        create_template
        exit 0
        ;;
    --verify)
        verify_env
        exit $?
        ;;
    --interactive)
        interactive_setup
        exit 0
        ;;
    --from-file)
        load_from_file "$2"
        exit 0
        ;;
    --sync-railway)
        sync_railway_env
        exit 0
        ;;
    "")
        log_info "대화형 환경 변수 설정을 시작합니다..."
        interactive_setup
        ;;
    *)
        log_error "알 수 없는 옵션: $1"
        show_help
        exit 1
        ;;
esac