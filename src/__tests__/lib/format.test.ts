import { describe, test, expect } from 'vitest'
import {
  formatDate,
  formatCurrency,
  formatInvoiceStatus,
  sanitizeFilename,
} from '@/lib/format'

describe('formatDate', () => {
  test('long 포맷으로 날짜를 변환한다', () => {
    expect(formatDate('2025-10-07', 'long')).toBe('2025년 10월 7일')
    expect(formatDate('2025-01-01', 'long')).toBe('2025년 1월 1일')
  })

  test('short 포맷으로 날짜를 변환한다', () => {
    const result = formatDate('2025-10-07', 'short')
    // 한국어 로케일의 short 포맷은 "2025. 10. 07." 형식
    expect(result).toBe('2025. 10. 07.')
  })

  test('numeric 포맷으로 날짜를 변환한다', () => {
    expect(formatDate('2025-10-07', 'numeric')).toBe('2025-10-07')
  })

  test('Date 객체를 받아서 변환한다', () => {
    const date = new Date('2025-10-07')
    expect(formatDate(date, 'numeric')).toBe('2025-10-07')
  })

  test('유효하지 않은 날짜는 "-"를 반환한다', () => {
    expect(formatDate('invalid-date')).toBe('-')
    expect(formatDate('not a date', 'short')).toBe('-')
  })

  test('기본값은 long 포맷이다', () => {
    expect(formatDate('2025-10-07')).toBe('2025년 10월 7일')
  })
})

describe('formatCurrency', () => {
  test('기본 통화 기호(₩)와 함께 금액을 포맷한다', () => {
    expect(formatCurrency(1000000)).toBe('₩1,000,000')
    expect(formatCurrency(1500000)).toBe('₩1,500,000')
    expect(formatCurrency(0)).toBe('₩0')
  })

  test('통화 기호 없이 금액을 포맷한다', () => {
    expect(formatCurrency(1000000, { showSymbol: false })).toBe('1,000,000')
    expect(formatCurrency(1500000, { showSymbol: false })).toBe('1,500,000')
  })

  test('"원" 단위를 표시한다', () => {
    expect(formatCurrency(1000000, { showSymbol: false, showWon: true })).toBe(
      '1,000,000원'
    )
  })

  test('숫자가 아닌 값은 0으로 처리한다', () => {
    expect(formatCurrency(NaN)).toBe('₩0')
    expect(formatCurrency(NaN, { showSymbol: false })).toBe('0원')
  })

  test('소수점이 있는 금액도 처리한다', () => {
    expect(formatCurrency(1234.56)).toBe('₩1,234.56')
  })

  test('음수 금액도 처리한다', () => {
    expect(formatCurrency(-1000)).toBe('₩-1,000')
  })
})

describe('formatInvoiceStatus', () => {
  test('pending 상태를 "대기"로 변환한다', () => {
    expect(formatInvoiceStatus('pending')).toBe('대기')
  })

  test('approved 상태를 "승인"으로 변환한다', () => {
    expect(formatInvoiceStatus('approved')).toBe('승인')
  })

  test('rejected 상태를 "거절"로 변환한다', () => {
    expect(formatInvoiceStatus('rejected')).toBe('거절')
  })
})

describe('sanitizeFilename', () => {
  test('특수문자를 제거하고 공백을 하이픈으로 변환한다', () => {
    expect(sanitizeFilename('견적서 #001 (2025.10.07)')).toBe(
      '견적서-001-2025-10-07'
    )
  })

  test('여러 공백을 하나의 하이픈으로 변환한다', () => {
    expect(sanitizeFilename('파일   이름   테스트')).toBe('파일-이름-테스트')
  })

  test('마침표를 하이픈으로 변환한다', () => {
    expect(sanitizeFilename('test.file.name')).toBe('test-file-name')
  })

  test('소문자로 변환한다', () => {
    expect(sanitizeFilename('ABC Test')).toBe('abc-test')
  })

  test('괄호와 해시를 제거한다', () => {
    expect(sanitizeFilename('(test) #123')).toBe('test-123')
  })
})
