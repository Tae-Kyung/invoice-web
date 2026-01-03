/**
 * Next.js Instrumentation Hook
 * 서버 시작 시 실행되는 계측 코드입니다.
 * Sentry 서버 설정을 초기화합니다.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // 서버 환경에서만 Sentry 서버 설정 로드
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  // Edge Runtime(Middleware 등)에서 Sentry Edge 설정 로드
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}
