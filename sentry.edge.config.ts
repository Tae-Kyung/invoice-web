/**
 * Sentry Edge Runtime 설정
 * Edge Runtime(Middleware 등)에서 발생하는 에러를 모니터링합니다.
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // Sentry DSN
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 환경 설정
  environment: process.env.NODE_ENV,

  // 트레이스 샘플링 비율
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 디버그 모드
  debug: process.env.NODE_ENV === 'development',

  // Edge Runtime에서는 제한된 통합만 사용 가능
  integrations: [],

  // 에러 필터링
  beforeSend(event) {
    // 개발 환경에서는 모든 이벤트 무시
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },
})
