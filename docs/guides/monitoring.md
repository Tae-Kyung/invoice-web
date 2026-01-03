# 모니터링 및 로깅 가이드

이 문서는 견적서 관리 시스템의 모니터링 및 로깅 인프라 설정 및 운영 방법을 설명합니다.

## 목차

1. [개요](#개요)
2. [Sentry 에러 모니터링](#sentry-에러-모니터링)
3. [Vercel Analytics](#vercel-analytics)
4. [로깅 시스템](#로깅-시스템)
5. [알림 설정](#알림-설정)
6. [모범 사례](#모범-사례)

---

## 개요

### 모니터링 스택

- **Sentry**: 에러 추적, 성능 모니터링, 세션 리플레이
- **Vercel Analytics**: 페이지 뷰, 사용자 트래픽 분석
- **Vercel Speed Insights**: Core Web Vitals, 성능 메트릭
- **구조화된 로깅**: 개발/프로덕션 환경별 로그 관리

### 주요 기능

- 클라이언트/서버 에러 자동 캡처
- 사용자 행동 재생 (Session Replay)
- 성능 트레이싱 (Performance Monitoring)
- 민감 정보 자동 마스킹
- 환경별 로그 레벨 필터링

---

## Sentry 에러 모니터링

### 1. Sentry 프로젝트 생성

1. [Sentry](https://sentry.io/) 계정 생성
2. 새 프로젝트 생성
   - Platform: **Next.js**
   - Alert frequency: **On every new issue** (권장)
3. DSN 복사 (예: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

### 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수 추가:

```bash
# Sentry DSN (필수)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# 소스맵 업로드용 (선택 - CI/CD 환경에서 권장)
SENTRY_ORG=your-organization-name
SENTRY_PROJECT=invoice-web
SENTRY_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxx
```

**환경 변수 설명**:

- `NEXT_PUBLIC_SENTRY_DSN`: Sentry 프로젝트 DSN (클라이언트에서 접근 가능)
- `SENTRY_ORG`: Sentry 조직명 (소스맵 업로드용)
- `SENTRY_PROJECT`: Sentry 프로젝트명
- `SENTRY_AUTH_TOKEN`: Sentry 인증 토큰 (Settings > Auth Tokens에서 생성)

### 3. Sentry 설정 파일

프로젝트에는 다음 Sentry 설정 파일들이 구성되어 있습니다:

#### `sentry.client.config.ts`

- 브라우저에서 발생하는 에러 캡처
- 세션 리플레이 (사용자 행동 재생)
- 브라우저 트레이싱

**주요 설정**:

```typescript
// 샘플링 비율
tracesSampleRate: 0.1, // 10%의 트랜잭션만 트레이싱 (비용 절감)
replaysSessionSampleRate: 0.1, // 10%의 일반 세션 기록
replaysOnErrorSampleRate: 1.0, // 100%의 에러 세션 기록

// 민감 정보 마스킹
maskAllText: true, // 모든 텍스트 마스킹
blockAllMedia: true, // 모든 미디어 차단
```

#### `sentry.server.config.ts`

- Next.js 서버 및 API 라우트 에러 캡처
- HTTP 요청 추적

#### `sentry.edge.config.ts`

- Edge Runtime (Middleware) 에러 캡처

#### `instrumentation.ts`

- Next.js 서버 시작 시 Sentry 초기화
- Runtime 환경별 설정 로드

### 4. 개발 환경 동작

개발 환경(`NODE_ENV=development`)에서는:

- 모든 Sentry 이벤트가 무시됩니다 (`beforeSend`에서 `null` 반환)
- 로컬 개발 시 Sentry에 데이터가 전송되지 않습니다
- 콘솔 로그는 정상적으로 출력됩니다

### 5. 프로덕션 배포

Vercel에 배포 시:

1. Vercel 대시보드에서 환경 변수 설정
2. `NEXT_PUBLIC_SENTRY_DSN` 추가
3. (선택) 소스맵 업로드용 `SENTRY_AUTH_TOKEN` 추가
4. 배포 시 자동으로 소스맵 업로드

**소스맵 업로드 설정**:

```typescript
// next.config.ts
const sentryWebpackPluginOptions = {
  hideSourceMaps: true, // 프로덕션에서 소스맵 숨김
  widenClientFileUpload: true, // 클라이언트 파일 범위 확대
}
```

---

## Vercel Analytics

### 1. Vercel Analytics 활성화

1. Vercel 프로젝트 대시보드 접속
2. **Analytics** 탭 선택
3. **Enable Analytics** 클릭
4. (선택) **Speed Insights** 활성화

### 2. 자동 데이터 수집

코드에 이미 통합되어 있어 별도 설정 불필요:

```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 3. 측정 메트릭

**Vercel Analytics**:

- 페이지 뷰 (Page Views)
- 고유 방문자 (Unique Visitors)
- 상위 페이지 (Top Pages)
- 참조 출처 (Referrers)

**Vercel Speed Insights**:

- **LCP** (Largest Contentful Paint): 2.5초 이하 목표
- **FID** (First Input Delay): 100ms 이하 목표
- **CLS** (Cumulative Layout Shift): 0.1 이하 목표
- **TTFB** (Time to First Byte): 800ms 이하 목표

---

## 로깅 시스템

### 1. 구조화된 로거 사용

프로젝트는 `src/lib/logger.ts`에 구조화된 로깅 시스템을 제공합니다.

#### 로그 레벨

- `debug`: 디버깅 정보 (개발 환경에서만 출력)
- `info`: 일반 정보성 로그
- `warn`: 경고 (잠재적 문제)
- `error`: 에러 (자동으로 Sentry에 보고)

#### 사용 예시

```typescript
import { logger } from '@/lib/logger'

// 정보성 로그
logger.info('사용자 로그인 성공', { userId: '123' })

// 경고 로그
logger.warn('API 응답 느림', { endpoint: '/api/invoices', duration: 3000 })

// 에러 로그 (자동으로 Sentry에 보고)
logger.error(
  'Notion API 호출 실패',
  { databaseId: 'xxx', operation: 'query' },
  new Error('rate_limited')
)

// 디버그 로그 (개발 환경에서만)
logger.debug('캐시 히트', { key: 'invoice-123', ttl: 300 })
```

### 2. 환경별 로그 출력

**개발 환경** (`NODE_ENV=development`):

```
[2025-01-03T10:30:45.123Z] INFO : 사용자 로그인 성공
  Context: { userId: '123' }
```

**프로덕션 환경** (`NODE_ENV=production`):

```json
{
  "timestamp": "2025-01-03T10:30:45.123Z",
  "level": "info",
  "message": "사용자 로그인 성공",
  "context": { "userId": "123" }
}
```

### 3. 민감 정보 자동 마스킹

다음 키워드를 포함한 필드는 자동으로 `[REDACTED]`로 마스킹됩니다:

- `apikey`, `api_key`
- `password`
- `token`
- `secret`
- `auth`
- `credential`
- `private`

```typescript
logger.info('API 호출', {
  apiKey: 'secret_xxxxx', // [REDACTED]로 마스킹
  endpoint: '/api/users', // 정상 출력
})
```

### 4. Sentry 통합

`error` 레벨 로그는 자동으로 Sentry에 보고됩니다 (프로덕션 환경에서만):

```typescript
logger.error('결제 처리 실패', { orderId: '123' }, new Error('Payment failed'))
// → Sentry에 자동 보고
```

---

## 알림 설정

### 1. Sentry Alerts 설정

#### Alert 규칙 생성

1. Sentry 프로젝트 > **Alerts** 탭
2. **Create Alert** 클릭
3. Alert 규칙 설정:

**예시 1: 새로운 에러 발생 시 즉시 알림**

- **When**: `A new issue is created`
- **Then**: `Send a notification to Email`
- **Frequency**: `Immediately`

**예시 2: 에러 급증 감지**

- **When**: `The issue is seen more than 100 times in 1 hour`
- **Then**: `Send a notification to Slack`
- **Frequency**: `At most once every 30 minutes`

**예시 3: 에러율 임계값 초과**

- **When**: `When error rate exceeds 5% for 15 minutes`
- **Then**: `Send a notification to PagerDuty`
- **Frequency**: `Immediately`

#### 알림 채널

- **Email**: 기본 제공
- **Slack**: Slack 워크스페이스 연동
- **Discord**: Webhook URL 설정
- **PagerDuty**: 온콜 알림
- **Microsoft Teams**: Teams 채널 연동

### 2. Vercel 알림 설정

1. Vercel 프로젝트 > **Settings** > **Notifications**
2. 알림 채널 추가:
   - **Email Notifications**
   - **Slack Notifications**
   - **GitHub Notifications**

**알림 이벤트**:

- Deployment Started
- Deployment Ready
- Deployment Failed
- Domain Configuration Updated

### 3. 권장 알림 설정

| 이벤트                     | 알림 채널 | 긴급도 | 빈도 제한         |
| -------------------------- | --------- | ------ | ----------------- |
| 새로운 치명적 에러         | Email     | 높음   | 즉시              |
| 에러 10회 이상 발생        | Slack     | 중간   | 30분마다 최대 1회 |
| 에러율 5% 초과             | Email     | 높음   | 1시간마다 최대 1회|
| Vercel 배포 실패           | Email     | 높음   | 즉시              |
| API 응답 시간 3초 초과     | Slack     | 낮음   | 1시간마다 최대 1회|

---

## 모범 사례

### 1. 에러 로깅

**좋은 예**:

```typescript
try {
  const invoice = await getInvoiceFromNotion(id)
  logger.info('견적서 조회 성공', { invoiceId: id })
} catch (error) {
  logger.error(
    '견적서 조회 실패',
    {
      invoiceId: id,
      operation: 'getInvoice',
      errorType: error instanceof Error ? error.name : 'Unknown',
    },
    error instanceof Error ? error : new Error(String(error))
  )
  throw error
}
```

**나쁜 예**:

```typescript
try {
  const invoice = await getInvoiceFromNotion(id)
} catch (error) {
  console.error(error) // 구조화되지 않은 로그
  // Sentry에 보고되지 않음
}
```

### 2. 성능 모니터링

```typescript
import * as Sentry from '@sentry/nextjs'

async function fetchInvoices() {
  // 성능 트레이싱
  const transaction = Sentry.startTransaction({
    name: 'fetchInvoices',
    op: 'function',
  })

  try {
    const invoices = await queryNotionDatabase()
    transaction.setStatus('ok')
    return invoices
  } catch (error) {
    transaction.setStatus('internal_error')
    throw error
  } finally {
    transaction.finish()
  }
}
```

### 3. 사용자 컨텍스트 추가

```typescript
import * as Sentry from '@sentry/nextjs'

// 사용자 정보 설정 (로그인 후)
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
})

// 사용자 정보 제거 (로그아웃 시)
Sentry.setUser(null)
```

### 4. 브레드크럼 추가

```typescript
import * as Sentry from '@sentry/nextjs'

// 사용자 행동 기록
Sentry.addBreadcrumb({
  category: 'invoice',
  message: 'User viewed invoice',
  level: 'info',
  data: {
    invoiceId: '123',
  },
})
```

### 5. 환경별 샘플링 조정

```typescript
// sentry.client.config.ts
tracesSampleRate: process.env.NODE_ENV === 'production'
  ? 0.1  // 프로덕션: 10% 샘플링 (비용 절감)
  : 1.0, // 개발: 100% 샘플링 (디버깅)
```

---

## 대시보드 활용

### Sentry 대시보드

- **Issues**: 발생한 에러 목록 및 상세 정보
- **Performance**: API 응답 시간, 트랜잭션 추이
- **Releases**: 배포 버전별 에러 추적
- **Replays**: 에러 발생 시 사용자 행동 재생

### Vercel Analytics 대시보드

- **Overview**: 전체 트래픽 현황
- **Pages**: 페이지별 방문 통계
- **Referrers**: 유입 경로 분석
- **Speed Insights**: 성능 메트릭 추이

---

## 문제 해결

### Sentry에 이벤트가 전송되지 않음

1. **환경 변수 확인**:
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```
2. **개발 환경 확인**: 개발 환경에서는 이벤트가 무시됩니다
3. **프로덕션 빌드 테스트**:
   ```bash
   npm run build
   npm start
   ```

### 로그가 출력되지 않음

1. **로그 레벨 확인**: `debug` 로그는 프로덕션에서 출력되지 않습니다
2. **환경 변수 확인**: `NODE_ENV` 설정 확인

### Vercel Analytics 데이터 없음

1. **Analytics 활성화 확인**: Vercel 대시보드에서 활성화 여부 확인
2. **배포 확인**: 프로덕션 배포 후 데이터 수집 시작
3. **시간 대기**: 데이터 수집까지 최대 1시간 소요

---

## 참고 자료

- [Sentry Next.js 공식 문서](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics 공식 문서](https://vercel.com/docs/analytics)
- [Vercel Speed Insights 공식 문서](https://vercel.com/docs/speed-insights)
- [Web Vitals 가이드](https://web.dev/vitals/)

---

## 변경 이력

- **2025-01-03**: 초기 문서 작성
  - Sentry 에러 모니터링 설정
  - Vercel Analytics 통합
  - 구조화된 로깅 시스템
  - 알림 설정 가이드
