/**
 * Sentry 서버 측 설정
 * Next.js 서버 및 API 라우트에서 발생하는 에러를 모니터링합니다.
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // Sentry DSN (Data Source Name)
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 환경 설정
  environment: process.env.NODE_ENV,

  // 트레이스 샘플링 비율
  // 프로덕션에서는 0.1 (10%) 권장
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 디버그 모드 (개발 환경에서만)
  debug: process.env.NODE_ENV === 'development',

  // 에러 필터링
  beforeSend(event, hint) {
    // 개발 환경에서는 모든 이벤트 무시
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    const error = hint.originalException

    // 특정 에러 무시
    if (error instanceof Error) {
      // Notion API 할당량 초과 (예상된 에러)
      if (error.message.includes('rate_limited')) {
        return null
      }
    }

    return event
  },

  // 민감한 정보가 포함될 수 있는 헤더 제외
  sendDefaultPii: false,

  // 서버 측 통합 설정
  integrations: [
    // HTTP 통합
    Sentry.httpIntegration(),
  ],
})
