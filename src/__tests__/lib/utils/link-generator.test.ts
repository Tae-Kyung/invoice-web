import { describe, test, expect, vi } from 'vitest'
import {
  generateInvoiceUrl,
  generateShortUrl,
} from '@/lib/utils/link-generator'

// env 모듈 모킹
vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: 'https://example.com',
  },
}))

describe('generateInvoiceUrl', () => {
  test('견적서 ID로 전체 URL을 생성한다', () => {
    const invoiceId = 'abc123-def456-ghi789'
    const url = generateInvoiceUrl(invoiceId)
    expect(url).toBe('https://example.com/invoice/abc123-def456-ghi789')
  })

  test('다양한 ID 형식을 처리한다', () => {
    expect(generateInvoiceUrl('12345')).toBe('https://example.com/invoice/12345')
    expect(generateInvoiceUrl('test-invoice-001')).toBe(
      'https://example.com/invoice/test-invoice-001'
    )
  })

  test('긴 ID도 올바르게 처리한다', () => {
    const longId = 'a'.repeat(100)
    const url = generateInvoiceUrl(longId)
    expect(url).toBe(`https://example.com/invoice/${longId}`)
  })
})

describe('generateShortUrl', () => {
  test('ID의 처음 8자리를 추출하여 짧은 URL을 생성한다', () => {
    const invoiceId = 'abc123-def456-ghi789'
    const shortUrl = generateShortUrl(invoiceId)
    expect(shortUrl).toBe('...abc123-d')
  })

  test('8자 미만의 ID도 처리한다', () => {
    const shortId = '12345'
    const shortUrl = generateShortUrl(shortId)
    expect(shortUrl).toBe('...12345')
  })

  test('정확히 8자인 ID를 처리한다', () => {
    const exactId = '12345678'
    const shortUrl = generateShortUrl(exactId)
    expect(shortUrl).toBe('...12345678')
  })

  test('빈 문자열을 처리한다', () => {
    const shortUrl = generateShortUrl('')
    expect(shortUrl).toBe('...')
  })
})
