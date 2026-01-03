# 노션 기반 견적서 관리 시스템 - 개발 로드맵

노션을 데이터베이스로 활용하여 견적서를 관리하고, 클라이언트가 웹에서 조회 및 PDF 다운로드할 수 있는 시스템

## 개요

**노션 기반 견적서 관리 시스템 MVP**는 프리랜서 및 소규모 기업을 위한 견적서 관리 솔루션으로 다음 기능을 제공합니다:

- **Notion 데이터베이스 연동**: Notion API를 통한 견적서 데이터 실시간 조회
- **견적서 웹 뷰어**: 고유 URL을 통한 견적서 온라인 조회
- **PDF 다운로드**: 견적서를 PDF 파일로 변환 및 다운로드
- **관리자 대시보드**: 발행한 견적서 목록 조회 및 관리 (Phase 2)

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 표시

---

## Phase 1: MVP 핵심 기능 (견적서 조회 시스템)

### Task 001: 프로젝트 초기 설정 - 완료

- See: 초기 설정 완료됨
- [x] Next.js 15.5.3 + App Router + Turbopack 설정
- [x] TypeScript 5 + TailwindCSS v4 + shadcn/ui 설정
- [x] ESLint + Prettier + Husky + lint-staged 설정
- [x] 프로젝트 디렉토리 구조 수립
- [x] 환경 변수 설정 (NOTION_API_KEY, NOTION_DATABASE_ID)

### Task 002: Notion API 연동 - 완료

- See: `src/lib/notion.ts`, `src/lib/services/invoice.service.ts`
- [x] @notionhq/client SDK 설정 및 초기화
- [x] 견적서 데이터 조회 함수 구현 (getInvoiceFromNotion)
- [x] 견적 항목 병렬 조회 구현 (fetchInvoiceItems)
- [x] Notion -> Invoice 타입 변환 유틸리티 구현
- [x] 에러 처리 및 재시도 로직 구현 (withRetry)
- [x] 캐싱 및 Request Deduplication 적용

### Task 003: 타입 정의 및 인터페이스 설계 - 완료

- See: `src/types/invoice.ts`, `src/types/notion.ts`, `src/types/pdf.ts`
- [x] Invoice, InvoiceItem, InvoiceStatus 타입 정의
- [x] NotionPage, InvoicePageProperties, ItemPageProperties 타입 정의
- [x] 타입 가드 함수 구현 (isInvoicePage, isItemPage)
- [x] PDF 관련 타입 정의

### Task 004: 견적서 조회 페이지 구현 - 완료

- See: `src/app/invoice/[id]/page.tsx`
- [x] 동적 라우트 설정 (/invoice/[id])
- [x] Server Component로 견적서 데이터 페칭
- [x] Suspense를 활용한 점진적 로딩 구현
- [x] Open Graph 메타데이터 생성 (링크 미리보기)
- [x] 반응형 레이아웃 적용

### Task 005: 견적서 UI 컴포넌트 구현 - 완료

- See: `src/components/invoice/`
- [x] InvoiceHeader 컴포넌트 (견적서 번호, 발행일, 유효기간)
- [x] InvoiceClientInfo 컴포넌트 (클라이언트 정보)
- [x] InvoiceTable 컴포넌트 (항목 테이블)
- [x] InvoiceSummary 컴포넌트 (총액 요약)
- [x] InvoiceSkeleton 컴포넌트 (로딩 UI)

### Task 006: PDF 생성 기능 구현 - 완료

- See: `src/app/api/generate-pdf/route.ts`, `src/components/pdf/InvoiceTemplate.tsx`
- [x] @react-pdf/renderer 설정 및 한글 폰트 등록
- [x] InvoicePDFDocument 템플릿 컴포넌트 구현
- [x] PDF 생성 API Route 구현 (POST /api/generate-pdf)
- [x] PDFDownloadButton 클라이언트 컴포넌트 구현
- [x] 파일명 생성 및 다운로드 헤더 설정

### Task 007: 에러 처리 및 404 페이지 - 완료

- See: `src/app/invoice/[id]/not-found.tsx`, `src/app/invoice/[id]/error.tsx`
- [x] 견적서 not-found 페이지 구현
- [x] 견적서 error 페이지 구현
- [x] 전역 not-found 페이지 구현
- [x] 친절한 에러 메시지 및 안내 제공

### Task 008: API Rate Limiting 구현 - 완료

- See: `src/middleware.ts`, `src/lib/rate-limit.ts`
- [x] IP 기반 Rate Limiting 미들웨어 구현
- [x] 분당 최대 요청 횟수 제한 (10회)
- [x] Rate Limit 헤더 응답 (X-RateLimit-Limit, X-RateLimit-Remaining)
- [x] 429 Too Many Requests 에러 처리

---

## Phase 2: 관리자 기능 (MVP 이후)

### Task 009: 관리자 인증 시스템 - 완료

- See: `src/app/(auth)/admin-login/`, `src/lib/auth/`
- [x] 관리자 로그인 페이지 구현
- [x] JWT 기반 세션 관리 (jose 라이브러리)
- [x] 비밀번호 검증 로직 구현
- [x] 미들웨어에서 관리자 페이지 보호
- [x] 로그아웃 기능 구현

### Task 010: 관리자 대시보드 레이아웃 - 완료

- See: `src/app/admin/layout.tsx`, `src/components/admin/`
- [x] 관리자 레이아웃 컴포넌트 구현
- [x] 사이드바 네비게이션 (admin-nav)
- [x] 헤더 컴포넌트 (admin-header)
- [x] 로그아웃 버튼 컴포넌트

### Task 011: 견적서 목록 페이지 - 완료

- See: `src/app/admin/invoices/page.tsx`
- [x] 견적서 목록 조회 기능 (getInvoicesFromNotion)
- [x] 테이블 형태 목록 표시 (invoice-table)
- [x] 페이지네이션 구현 (Notion API cursor 기반)
- [x] 정렬 기능 (발행일, 금액)
- [x] 로딩 스켈레톤 UI

### Task 012: 검색 및 필터 기능 - 완료

- See: `src/components/admin/search-bar.tsx`, `src/components/admin/filter-panel.tsx`
- [x] 클라이언트명/견적서 번호 검색 기능
- [x] 상태별 필터 (대기/승인/거절)
- [x] 날짜 범위 필터
- [x] 검색 서비스 로직 (searchInvoices)

### Task 013: 링크 공유 기능 - 완료

- See: `src/components/admin/share-button.tsx`, `src/components/admin/copy-button.tsx`
- [x] 견적서 URL 복사 버튼
- [x] 이메일로 공유 기능
- [x] 텔레그램으로 공유 기능
- [x] 링크 표시 컴포넌트 (link-display)

---

## Phase 3: 추가 개선 사항

### Task 014: 성능 최적화 - 완료

- See: `docs/performance-optimization.md`, `src/lib/cache.ts`, `next.config.ts`
- [x] unstable_cache를 활용한 데이터 캐싱 최적화 (단일 견적서 5분, 목록 2분)
- [x] 이미지 최적화 (WebP, AVIF 포맷 지원 설정)
- [x] 번들 사이즈 분석 및 최적화 (@next/bundle-analyzer, optimizePackageImports)
- [x] Lighthouse 성능 점수 개선 기반 구축

### Task 015: 접근성 개선

- [ ] ARIA 레이블 및 역할 추가
- [ ] 키보드 네비게이션 지원
- [ ] 스크린 리더 호환성 테스트
- [ ] 색상 대비 검사 및 개선

### Task 016: 테스트 코드 작성

- [ ] 단위 테스트 작성 (Vitest)
- [ ] 컴포넌트 테스트 (React Testing Library)
- [ ] E2E 테스트 (Playwright)
- [ ] API 엔드포인트 테스트

### Task 017: 모니터링 및 로깅

- [ ] 에러 모니터링 설정 (Sentry)
- [ ] 분석 도구 연동 (Vercel Analytics)
- [ ] 로깅 시스템 개선
- [ ] 알림 설정 (에러 발생 시)

---

## Phase 4: 고급 기능 (향후 계획)

### Task 018: 이메일 자동 발송

- [ ] 이메일 서비스 연동 (SendGrid/Resend)
- [ ] 견적서 발송 템플릿 디자인
- [ ] 발송 내역 관리
- [ ] 발송 상태 트래킹

### Task 019: 견적서 만료 알림

- [ ] 만료 예정 견적서 조회 로직
- [ ] 자동 알림 스케줄링
- [ ] 이메일/텔레그램 알림 발송

### Task 020: 견적서 상태 관리

- [ ] 클라이언트 승인/거절 기능
- [ ] 상태 변경 히스토리 기록
- [ ] 상태 변경 알림

### Task 021: 템플릿 커스터마이징

- [ ] 다중 PDF 템플릿 지원
- [ ] 회사 로고 업로드
- [ ] 색상 테마 설정
- [ ] 커스텀 필드 추가

### Task 022: 다국어 지원

- [ ] i18n 설정 (next-intl)
- [ ] 한국어/영어 번역
- [ ] 다국어 PDF 생성
- [ ] 언어 선택 UI

---

## 현재 진행 상황

### 완료된 작업

- Phase 1: MVP 핵심 기능 (Task 001-008) - 전체 완료
- Phase 2: 관리자 기능 (Task 009-013) - 전체 완료
- Task 014: 성능 최적화 - 완료

### 다음 작업 (우선순위)

- **Task 015: 접근성 개선** - 다음 작업으로 권장
  - ARIA 레이블 및 역할 추가
  - 키보드 네비게이션 지원
  - 스크린 리더 호환성

### 진행률

- Phase 1: 100% (8/8 완료)
- Phase 2: 100% (5/5 완료)
- Phase 3: 25% (1/4 완료)
- Phase 4: 0% (0/5 완료)
- **전체: 64% (14/22 완료)**

---

## 기술 스택

| 분류         | 기술                                    |
| ------------ | --------------------------------------- |
| Framework    | Next.js 15.5.3 (App Router + Turbopack) |
| Language     | TypeScript 5, React 19                  |
| Styling      | TailwindCSS v4, shadcn/ui               |
| External API | @notionhq/client (Notion API SDK)       |
| PDF          | @react-pdf/renderer                     |
| Auth         | JWT (jose 라이브러리)                   |
| Deployment   | Vercel                                  |

---

**문서 버전**: v1.1
**최종 업데이트**: 2026-01-03
**MVP 상태**: 완료 (Phase 1 + Phase 2)
