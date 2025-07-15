#!/bin/bash
# EduTech ChatBot 상태 확인 스크립트
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
echo "🔍 EduTech ChatBot 시스템 상태 확인"
echo "=================================================="

# URL 설정
BACKEND_URL="https://yuriaichatbot-production-1f9d.up.railway.app"
BACKEND_HEALTH_URL="$BACKEND_URL/api/health"
FRONTEND_URL="https://yuriaichatbot-frontend.vercel.app"

# 상태 확인 함수
check_service() {
    local service_name=$1
    local url=$2
    local timeout=${3:-10}
    
    log_info "$service_name 상태 확인 중... ($url)"
    
    if curl -f -s -m "$timeout" "$url" > /dev/null 2>&1; then
        log_success "$service_name: 정상 작동"
        return 0
    else
        log_error "$service_name: 접속 실패"
        return 1
    fi
}

# 상세 상태 확인 함수
check_service_detailed() {
    local service_name=$1
    local url=$2
    local timeout=${3:-10}
    
    log_info "$service_name 상세 상태 확인 중..."
    
    # HTTP 상태 코드 확인
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" -m "$timeout" "$url" 2>/dev/null || echo "000")
    
    # 응답 시간 확인
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" -m "$timeout" "$url" 2>/dev/null || echo "0")
    
    case $http_code in
        200)
            log_success "$service_name: HTTP $http_code (응답시간: ${response_time}초)"
            return 0
            ;;
        000)
            log_error "$service_name: 연결 실패 (타임아웃 또는 DNS 오류)"
            return 1
            ;;
        *)
            log_error "$service_name: HTTP $http_code (응답시간: ${response_time}초)"
            return 1
            ;;
    esac
}

# 백엔드 API 엔드포인트 확인
check_api_endpoints() {
    log_info "백엔드 API 엔드포인트 확인 중..."
    
    endpoints=(
        "/api/health"
        "/api/admin/textbooks"
        "/api/admin/passage-sets"
        "/api/admin/system-prompts"
    )
    
    success_count=0
    total_count=${#endpoints[@]}
    
    for endpoint in "${endpoints[@]}"; do
        url="$BACKEND_URL$endpoint"
        if curl -f -s -m 5 "$url" > /dev/null 2>&1; then
            log_success "API $endpoint: 정상"
            ((success_count++))
        else
            log_error "API $endpoint: 실패"
        fi
    done
    
    log_info "API 엔드포인트 상태: $success_count/$total_count 정상"
    
    if [ $success_count -eq $total_count ]; then
        return 0
    else
        return 1
    fi
}

# 1. 백엔드 상태 확인
echo ""
echo "🔧 백엔드 서비스 확인"
echo "----------------------------------------"

backend_status=0
if check_service_detailed "백엔드 서버" "$BACKEND_URL" 15; then
    # 헬스체크 엔드포인트 확인
    if check_service_detailed "헬스체크 엔드포인트" "$BACKEND_HEALTH_URL" 10; then
        # 헬스체크 응답 내용 확인
        health_response=$(curl -s -m 5 "$BACKEND_HEALTH_URL" 2>/dev/null)
        if echo "$health_response" | grep -q "OK"; then
            log_success "헬스체크 응답: 정상"
            
            # API 엔드포인트 확인
            if check_api_endpoints; then
                log_success "백엔드 전체 상태: 정상"
            else
                log_warning "백엔드 일부 API 엔드포인트에 문제가 있습니다"
                backend_status=1
            fi
        else
            log_error "헬스체크 응답: 비정상"
            backend_status=1
        fi
    else
        backend_status=1
    fi
else
    backend_status=1
fi

# 2. 프론트엔드 상태 확인
echo ""
echo "🌐 프론트엔드 서비스 확인"
echo "----------------------------------------"

frontend_status=0
if check_service_detailed "프론트엔드 서버" "$FRONTEND_URL" 15; then
    # 프론트엔드 주요 페이지 확인
    pages=(
        "/"
        "/admin"
        "/test"
    )
    
    page_success_count=0
    page_total_count=${#pages[@]}
    
    for page in "${pages[@]}"; do
        url="$FRONTEND_URL$page"
        if curl -f -s -m 10 "$url" > /dev/null 2>&1; then
            log_success "페이지 $page: 정상"
            ((page_success_count++))
        else
            log_error "페이지 $page: 실패"
        fi
    done
    
    log_info "프론트엔드 페이지 상태: $page_success_count/$page_total_count 정상"
    
    if [ $page_success_count -eq $page_total_count ]; then
        log_success "프론트엔드 전체 상태: 정상"
    else
        log_warning "프론트엔드 일부 페이지에 문제가 있습니다"
        frontend_status=1
    fi
else
    frontend_status=1
fi

# 3. 데이터베이스 연결 확인 (간접적)
echo ""
echo "🗄️  데이터베이스 연결 확인"
echo "----------------------------------------"

database_status=0
if curl -f -s -m 10 "$BACKEND_URL/api/admin/textbooks" > /dev/null 2>&1; then
    log_success "데이터베이스 연결: 정상 (API 응답 확인)"
else
    log_error "데이터베이스 연결: 실패 (API 응답 없음)"
    database_status=1
fi

# 4. 전체 시스템 상태 요약
echo ""
echo "📊 전체 시스템 상태 요약"
echo "=================================================="

total_issues=0
((total_issues += backend_status))
((total_issues += frontend_status))
((total_issues += database_status))

if [ $backend_status -eq 0 ]; then
    log_success "백엔드: 정상"
else
    log_error "백엔드: 문제 발생"
fi

if [ $frontend_status -eq 0 ]; then
    log_success "프론트엔드: 정상"
else
    log_error "프론트엔드: 문제 발생"
fi

if [ $database_status -eq 0 ]; then
    log_success "데이터베이스: 정상"
else
    log_error "데이터베이스: 문제 발생"
fi

echo ""
echo "🔗 서비스 링크:"
echo "   🌐 프론트엔드: $FRONTEND_URL"
echo "   ⚙️  백엔드: $BACKEND_URL"
echo "   📊 API 헬스체크: $BACKEND_HEALTH_URL"
echo "   👑 관리자 페이지: $FRONTEND_URL/admin"

# 문제 해결 가이드
if [ $total_issues -gt 0 ]; then
    echo ""
    echo "🛠️  문제 해결 가이드:"
    echo "----------------------------------------"
    
    if [ $backend_status -ne 0 ]; then
        echo "백엔드 문제 해결:"
        echo "   1. Railway 로그 확인: railway logs"
        echo "   2. 환경 변수 확인: railway variables"
        echo "   3. 서비스 재시작: railway service restart"
        echo "   4. 재배포: railway up"
    fi
    
    if [ $frontend_status -ne 0 ]; then
        echo "프론트엔드 문제 해결:"
        echo "   1. Vercel 로그 확인: vercel logs"
        echo "   2. 재배포: vercel --prod"
        echo "   3. 빌드 상태 확인: vercel ls"
    fi
    
    if [ $database_status -ne 0 ]; then
        echo "데이터베이스 문제 해결:"
        echo "   1. MongoDB Atlas 연결 확인"
        echo "   2. MONGODB_URI 환경 변수 확인"
        echo "   3. 네트워크 액세스 허용 확인"
    fi
fi

echo ""
echo "⏰ 상태 확인 완료: $(date)"

# 결과 반환
if [ $total_issues -eq 0 ]; then
    log_success "🎉 모든 시스템이 정상적으로 작동하고 있습니다!"
    exit 0
else
    log_error "⚠️  $total_issues개의 문제가 발견되었습니다"
    exit 1
fi