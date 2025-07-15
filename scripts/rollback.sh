#!/bin/bash
# EduTech ChatBot 롤백 스크립트
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
    echo "EduTech ChatBot 롤백 스크립트"
    echo ""
    echo "사용법:"
    echo "  ./rollback.sh <commit_hash>           # 특정 커밋으로 롤백"
    echo "  ./rollback.sh --show-commits         # 최근 커밋 목록 표시"
    echo "  ./rollback.sh --last-stable         # 마지막 안정 버전으로 롤백"
    echo "  ./rollback.sh --help                # 도움말 표시"
    echo ""
    echo "예시:"
    echo "  ./rollback.sh 28d33a1                # 특정 커밋으로 롤백"
    echo "  ./rollback.sh --show-commits         # 최근 20개 커밋 표시"
    echo ""
    echo "안전한 롤백을 위한 권장사항:"
    echo "  1. 롤백 전 현재 상태 백업"
    echo "  2. 데이터베이스 백업"
    echo "  3. 롤백 후 상태 확인"
}

# 최근 커밋 목록 표시
show_commits() {
    echo "📋 최근 커밋 목록 (최신 20개):"
    echo "=================================================="
    git log --oneline --format="%h %ad %s" --date=format:"%Y-%m-%d %H:%M:%S" -20
    echo ""
    echo "💡 롤백 방법:"
    echo "   ./rollback.sh <commit_hash>"
    echo "   예: ./rollback.sh 28d33a1"
}

# 마지막 안정 버전 찾기
find_last_stable() {
    # 안정 버전 키워드 목록
    local stable_keywords=("stable" "fix" "hotfix" "release" "deploy" "production")
    
    log_info "마지막 안정 버전 찾는 중..."
    
    # 최근 50개 커밋에서 안정 버전 찾기
    local commits=$(git log --oneline --format="%h %s" -50)
    
    while IFS= read -r line; do
        local commit_hash=$(echo "$line" | cut -d' ' -f1)
        local commit_msg=$(echo "$line" | cut -d' ' -f2-)
        
        for keyword in "${stable_keywords[@]}"; do
            if echo "$commit_msg" | grep -i "$keyword" > /dev/null; then
                echo "$commit_hash"
                return 0
            fi
        done
    done <<< "$commits"
    
    # 안정 버전을 찾지 못한 경우 기본값 반환
    echo "28d33a1"  # Fix critical CSV upload issues
}

# 롤백 실행
execute_rollback() {
    local commit_hash=$1
    
    if [ -z "$commit_hash" ]; then
        log_error "커밋 해시가 제공되지 않았습니다"
        show_help
        exit 1
    fi
    
    # 커밋 해시 유효성 검사
    if ! git rev-parse --verify "$commit_hash" &> /dev/null; then
        log_error "유효하지 않은 커밋 해시: $commit_hash"
        exit 1
    fi
    
    # 현재 브랜치 확인
    local current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        log_warning "현재 브랜치가 main이 아닙니다: $current_branch"
        log_info "main 브랜치로 전환합니다..."
        git checkout main
    fi
    
    # 롤백 대상 커밋 정보 표시
    log_info "롤백 대상 커밋 정보:"
    git log --oneline --format="%h %ad %s" --date=format:"%Y-%m-%d %H:%M:%S" -1 "$commit_hash"
    
    # 확인 메시지
    echo ""
    log_warning "⚠️  주의: 이 작업은 현재 코드를 완전히 덮어씁니다!"
    log_warning "계속하시겠습니까? (y/N)"
    read -r response
    
    if [ "$response" != "y" ] && [ "$response" != "Y" ]; then
        log_info "롤백이 취소되었습니다"
        exit 0
    fi
    
    # 현재 상태 백업
    local backup_branch="backup-before-rollback-$(date +%Y%m%d-%H%M%S)"
    log_info "현재 상태를 백업 브랜치로 저장: $backup_branch"
    git branch "$backup_branch"
    
    # 롤백 실행
    log_info "롤백 실행 중..."
    git reset --hard "$commit_hash"
    
    # 원격 저장소에 강제 푸시
    log_warning "원격 저장소에 강제 푸시합니다..."
    git push -f origin main
    
    log_success "Git 롤백 완료"
    
    # 백엔드 빌드 및 재배포
    log_info "백엔드 재배포 중..."
    cd backend
    
    # 불필요한 파일 정리
    rm -rf dist/ node_modules/ || true
    
    # 의존성 재설치
    npm install
    
    # 빌드
    npm run build
    
    # Railway 재배포
    if command -v railway &> /dev/null; then
        log_info "Railway 재배포 실행 중..."
        railway up
    else
        log_warning "Railway CLI가 설치되지 않았습니다. 수동으로 재배포해주세요"
    fi
    
    cd ..
    
    # 프론트엔드 재배포
    log_info "프론트엔드 재배포 중..."
    cd frontend
    
    # 불필요한 파일 정리
    rm -rf .next/ node_modules/ || true
    
    # 의존성 재설치
    npm install
    
    # 빌드
    npm run build
    
    # Vercel 재배포
    if command -v vercel &> /dev/null; then
        log_info "Vercel 재배포 실행 중..."
        vercel --prod
    else
        log_warning "Vercel CLI가 설치되지 않았습니다. 수동으로 재배포해주세요"
    fi
    
    cd ..
    
    # 롤백 완료 메시지
    echo ""
    echo "=================================================="
    log_success "🎉 롤백 완료!"
    echo "=================================================="
    echo ""
    echo "📋 롤백 정보:"
    echo "   🎯 타겟 커밋: $commit_hash"
    echo "   💾 백업 브랜치: $backup_branch"
    echo "   📅 롤백 시간: $(date)"
    echo ""
    echo "🔍 다음 단계:"
    echo "   1. 서비스 상태 확인: ./scripts/health-check.sh"
    echo "   2. 기능 테스트 수행"
    echo "   3. 문제 없으면 백업 브랜치 삭제: git branch -D $backup_branch"
    echo ""
    echo "🔗 서비스 링크:"
    echo "   🌐 프론트엔드: https://yuriaichatbot-frontend.vercel.app"
    echo "   ⚙️  백엔드: https://yuriaichatbot-production-1f9d.up.railway.app"
    echo ""
    
    # 자동 상태 확인 (선택사항)
    log_info "30초 후 자동으로 상태 확인을 실행합니다..."
    sleep 30
    
    if [ -f "scripts/health-check.sh" ]; then
        log_info "상태 확인 실행 중..."
        ./scripts/health-check.sh
    else
        log_warning "상태 확인 스크립트를 찾을 수 없습니다"
    fi
}

# 메인 실행 부분
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --show-commits)
        show_commits
        exit 0
        ;;
    --last-stable)
        log_info "마지막 안정 버전으로 롤백합니다..."
        stable_commit=$(find_last_stable)
        log_info "마지막 안정 버전: $stable_commit"
        execute_rollback "$stable_commit"
        ;;
    "")
        log_error "커밋 해시가 제공되지 않았습니다"
        show_help
        exit 1
        ;;
    *)
        log_info "커밋 $1로 롤백을 시작합니다..."
        execute_rollback "$1"
        ;;
esac