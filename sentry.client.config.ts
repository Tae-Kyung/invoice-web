/**
 * Sentry 클라이언트 측 설정
 * 브라우저에서 발생하는 에러를 모니터링합니다.
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // Sentry DSN (Data Source Name)
  // Sentry 프로젝트 설정에서 확인 가능
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 환경 설정
  environment: process.env.NODE_ENV,

  // 트레이스 샘플링 비율 (0.0 ~ 1.0)
  // 프로덕션에서는 0.1 (10%) 권장
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 세션 리플레이 샘플링 비율
  // 일반 세션: 10%, 에러 세션: 100% 기록
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // 디버그 모드 (개발 환경에서만 활성화)
  debug: process.env.NODE_ENV === 'development',

  // 통합 설정
  integrations: [
    // 세션 리플레이 (사용자 행동 재생)
    Sentry.replayIntegration({
      // 민감한 정보 마스킹
      maskAllText: true,
      blockAllMedia: true,
    }),
    // 브라우저 트레이싱
    Sentry.browserTracingIntegration(),
  ],

  // 에러 필터링: 특정 에러 무시
  beforeSend(event, hint) {
    // 개발 환경에서는 모든 이벤트 무시
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    // 원본 에러 객체
    const error = hint.originalException

    // 특정 에러 타입 무시
    if (error instanceof Error) {
      // 네트워크 에러 (사용자 연결 끊김 등)
      if (error.message.includes('NetworkError')) {
        return null
      }
      // 캔슬된 요청
      if (error.message.includes('AbortError')) {
        return null
      }
    }

    return event
  },

  // 민감한 정보가 포함될 수 있는 헤더 제외
  sendDefaultPii: false,
})
