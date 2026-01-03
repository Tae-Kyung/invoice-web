'use client'

import { useEffect } from 'react'

/**
 * 전역 에러 바운더리
 * 루트 레이아웃에서 발생하는 에러를 캐치합니다.
 * global-error.tsx는 html과 body 태그를 포함해야 합니다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 콘솔에 에러 로깅 (프로덕션에서는 외부 모니터링 서비스 연동 가능)
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="ko">
      <body>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
            치명적인 오류가 발생했습니다
          </h1>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            {error.message || '애플리케이션을 불러올 수 없습니다.'}
          </p>
          {error.digest && (
            <p
              style={{ fontSize: '14px', color: '#999', marginBottom: '24px' }}
            >
              오류 ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
