# Task 014: 성능 최적화

## 개요

애플리케이션의 전반적인 성능을 개선하여 사용자 경험을 향상시킵니다.
Lighthouse 성능 점수 90점 이상을 목표로 합니다.

## 관련 파일

- `src/lib/cache.ts` - 캐싱 유틸리티
- `src/lib/services/invoice.service.ts` - 견적서 서비스
- `src/app/invoice/[id]/page.tsx` - 견적서 조회 페이지
- `src/components/` - 모든 컴포넌트
- `next.config.ts` - Next.js 설정

## 수락 기준

1. Lighthouse Performance 점수 90점 이상
2. First Contentful Paint (FCP) 1.8초 이하
3. Largest Contentful Paint (LCP) 2.5초 이하
4. Cumulative Layout Shift (CLS) 0.1 이하
5. 빌드 타임 및 번들 사이즈 최적화

## 구현 단계

### 1단계: 캐싱 전략 개선

- [ ] unstable_cache 설정 검토 및 최적화
- [ ] revalidate 시간 조정 (데이터 특성에 맞게)
- [ ] Request Deduplication 검증
- [ ] ISR (Incremental Static Regeneration) 적용 검토

### 2단계: 이미지 최적화

- [ ] next/image 컴포넌트 활용
- [ ] 이미지 포맷 최적화 (WebP, AVIF)
- [ ] lazy loading 적용
- [ ] placeholder blur 설정

### 3단계: 번들 사이즈 최적화

- [ ] @next/bundle-analyzer 설정
- [ ] 불필요한 의존성 제거
- [ ] 동적 import 적용 (code splitting)
- [ ] Tree shaking 검증

### 4단계: 렌더링 최적화

- [ ] Server Component 최대 활용
- [ ] Client Component 범위 최소화
- [ ] Suspense 경계 최적화
- [ ] React.memo, useMemo 적용 검토

### 5단계: Core Web Vitals 측정 및 개선

- [ ] Lighthouse 측정 (초기값 기록)
- [ ] LCP 요소 최적화
- [ ] CLS 원인 분석 및 개선
- [ ] TBT (Total Blocking Time) 개선
- [ ] 최종 Lighthouse 측정 및 비교

## 테스트 체크리스트

> Playwright MCP를 활용한 성능 테스트 시나리오

- [ ] 견적서 조회 페이지 로딩 시간 측정
- [ ] PDF 다운로드 응답 시간 측정
- [ ] 관리자 견적서 목록 로딩 시간 측정
- [ ] 검색/필터 응답 시간 측정
- [ ] 모바일 환경 성능 테스트

## 참고 자료

- [Next.js 성능 최적화 가이드](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Core Web Vitals](https://web.dev/vitals/)
- [React Server Components](https://react.dev/reference/react/use-server)

## 변경 사항 요약

> 작업 완료 후 작성

<!--
예시:
- unstable_cache revalidate 시간을 60초에서 300초로 조정
- PDF 다운로드 버튼에 React.lazy 적용
- 번들 사이즈 15% 감소 (500KB -> 425KB)
- Lighthouse 점수: 72 -> 94
-->
