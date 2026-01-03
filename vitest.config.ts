import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [
    react(), // React 19 지원
    tsconfigPaths(), // tsconfig.json의 paths 자동 적용
  ],
  test: {
    // 테스트 환경 설정
    environment: 'happy-dom', // 빠른 DOM 시뮬레이션
    globals: true, // describe, test, expect 전역 사용
    setupFiles: ['./src/__tests__/setup.ts'], // 테스트 초기 설정

    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.config.{ts,js}',
        '**/types/**',
        '**/*.d.ts',
      ],
    },

    // 테스트 파일 패턴
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
