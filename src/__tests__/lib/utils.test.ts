import { describe, test, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn (className merge utility)', () => {
  test('여러 클래스명을 병합한다', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500')
    expect(result).toContain('px-4')
    expect(result).toContain('py-2')
    expect(result).toContain('bg-blue-500')
  })

  test('조건부 클래스명을 처리한다', () => {
    const result = cn('base-class', true && 'conditional-class')
    expect(result).toContain('base-class')
    expect(result).toContain('conditional-class')
  })

  test('false 조건의 클래스는 제외한다', () => {
    const result = cn('base-class', false && 'should-not-appear')
    expect(result).toContain('base-class')
    expect(result).not.toContain('should-not-appear')
  })

  test('충돌하는 Tailwind 클래스를 올바르게 병합한다', () => {
    const result = cn('px-4', 'px-8')
    expect(result).toBe('px-8')
  })

  test('빈 문자열과 undefined를 무시한다', () => {
    const result = cn('valid-class', '', undefined, 'another-valid')
    expect(result).toContain('valid-class')
    expect(result).toContain('another-valid')
  })

  test('배열 형태의 클래스명을 처리한다', () => {
    const result = cn(['class-1', 'class-2'], 'class-3')
    expect(result).toContain('class-1')
    expect(result).toContain('class-2')
    expect(result).toContain('class-3')
  })

  test('객체 형태의 조건부 클래스를 처리한다', () => {
    const result = cn({
      'always-present': true,
      'never-present': false,
    })
    expect(result).toContain('always-present')
    expect(result).not.toContain('never-present')
  })
})
