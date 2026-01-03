import { describe, test, expect } from 'vitest'
import {
  transformNotionToInvoice,
  normalizeDate,
  parseNumber,
} from '@/lib/utils/notion-parser'
import type { NotionPage, InvoicePageProperties, ItemPageProperties } from '@/types/notion'

// 테스트용 Notion 견적서 페이지 모의 데이터
const createMockInvoicePage = (
  overrides?: Partial<InvoicePageProperties>
): NotionPage & { properties: InvoicePageProperties } => {
  return {
    id: 'invoice-page-id-123',
    object: 'page',
    created_time: '2025-01-01T00:00:00.000Z',
    last_edited_time: '2025-01-01T00:00:00.000Z',
    created_by: { object: 'user', id: 'user-1' },
    last_edited_by: { object: 'user', id: 'user-1' },
    cover: null,
    icon: null,
    parent: { type: 'database_id', database_id: 'db-123' },
    archived: false,
    in_trash: false,
    is_locked: false,
    properties: {
      견적서번호: {
        type: 'title',
        title: [{ plain_text: 'INV-2025-001' }],
      },
      클라이언트명: {
        type: 'rich_text',
        rich_text: [{ plain_text: 'ABC 회사' }],
      },
      발행일: {
        type: 'date',
        date: { start: '2025-01-15' },
      },
      유효기간: {
        type: 'date',
        date: { start: '2025-01-22' },
      },
      총금액: {
        type: 'number',
        number: 5000000,
      },
      상태: {
        type: 'status',
        status: { name: '대기' },
      },
      항목: {
        type: 'relation',
        relation: [{ id: 'item-1' }, { id: 'item-2' }],
      },
      ...overrides,
    },
    url: 'https://notion.so/invoice-page-id-123',
    public_url: null,
  } as unknown as NotionPage & { properties: InvoicePageProperties }
}

// 테스트용 Notion 항목 페이지 모의 데이터
const createMockItemPage = (
  overrides?: Partial<ItemPageProperties>
): NotionPage & { properties: ItemPageProperties } => {
  return {
    id: 'item-page-id-456',
    object: 'page',
    created_time: '2025-01-01T00:00:00.000Z',
    last_edited_time: '2025-01-01T00:00:00.000Z',
    created_by: { object: 'user', id: 'user-1' },
    last_edited_by: { object: 'user', id: 'user-1' },
    cover: null,
    icon: null,
    parent: { type: 'database_id', database_id: 'db-items-123' },
    archived: false,
    in_trash: false,
    is_locked: false,
    properties: {
      항목명: {
        type: 'title',
        title: [{ plain_text: '웹사이트 디자인' }],
      },
      수량: {
        type: 'number',
        number: 1,
      },
      단가: {
        type: 'number',
        number: 3000000,
      },
      금액: {
        type: 'number',
        number: 3000000,
      },
      Invoices: {
        type: 'relation',
        relation: [{ id: 'invoice-page-id-123' }],
      },
      ...overrides,
    },
    url: 'https://notion.so/item-page-id-456',
    public_url: null,
  } as unknown as NotionPage & { properties: ItemPageProperties }
}

describe('transformNotionToInvoice', () => {
  test('정상적인 Notion 페이지를 Invoice 객체로 변환한다', () => {
    const invoicePage = createMockInvoicePage()
    const itemPages = [
      createMockItemPage(),
      createMockItemPage({
        항목명: {
          type: 'title',
          title: [{ plain_text: '백엔드 개발' }],
        },
        수량: { type: 'number', number: 2 },
        단가: { type: 'number', number: 1000000 },
        금액: { type: 'number', number: 2000000 },
      }),
    ]

    const result = transformNotionToInvoice(invoicePage, itemPages)

    expect(result.id).toBe('invoice-page-id-123')
    expect(result.invoiceNumber).toBe('INV-2025-001')
    expect(result.clientName).toBe('ABC 회사')
    expect(result.issueDate).toBe('2025-01-15')
    expect(result.validUntil).toBe('2025-01-22')
    expect(result.totalAmount).toBe(5000000)
    expect(result.status).toBe('pending')
    expect(result.items).toHaveLength(2)
    expect(result.items[0].description).toBe('웹사이트 디자인')
    expect(result.items[1].description).toBe('백엔드 개발')
  })

  test('견적서 번호가 없을 때 기본값을 사용한다', () => {
    const invoicePage = createMockInvoicePage({
      견적서번호: {
        type: 'title',
        title: [],
      },
    })

    const result = transformNotionToInvoice(invoicePage, [])

    expect(result.invoiceNumber).toBe('INV-UNKNOWN')
  })

  test('클라이언트명이 없을 때 "미지정"을 사용한다', () => {
    const invoicePage = createMockInvoicePage({
      클라이언트명: {
        type: 'rich_text',
        rich_text: [],
      },
    })

    const result = transformNotionToInvoice(invoicePage, [])

    expect(result.clientName).toBe('미지정')
  })

  test('발행일이 없을 때 현재 날짜를 사용한다', () => {
    const invoicePage = createMockInvoicePage({
      발행일: {
        type: 'date',
        date: null,
      },
    })

    const result = transformNotionToInvoice(invoicePage, [])

    // 현재 날짜의 ISO 형식 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0]
    expect(result.issueDate).toBe(today)
  })

  test('유효기간이 없을 때 발행일 + 7일을 사용한다', () => {
    const invoicePage = createMockInvoicePage({
      유효기간: {
        type: 'date',
        date: null,
      },
    })

    const result = transformNotionToInvoice(invoicePage, [])

    expect(result.validUntil).toBe('2025-01-22') // 발행일 2025-01-15 + 7일
  })

  test('총 금액이 없을 때 항목들의 합계를 사용한다', () => {
    const invoicePage = createMockInvoicePage({
      총금액: {
        type: 'number',
        number: null,
      },
    })
    const itemPages = [
      createMockItemPage({ 금액: { type: 'number', number: 1000000 } }),
      createMockItemPage({ 금액: { type: 'number', number: 2000000 } }),
    ]

    const result = transformNotionToInvoice(invoicePage, itemPages)

    expect(result.totalAmount).toBe(3000000)
  })

  test('상태를 한글에서 영문으로 변환한다', () => {
    const pendingPage = createMockInvoicePage({
      상태: { type: 'status', status: { name: '대기' } },
    })
    const approvedPage = createMockInvoicePage({
      상태: { type: 'status', status: { name: '승인' } },
    })
    const rejectedPage = createMockInvoicePage({
      상태: { type: 'status', status: { name: '거절' } },
    })

    expect(transformNotionToInvoice(pendingPage, []).status).toBe('pending')
    expect(transformNotionToInvoice(approvedPage, []).status).toBe('approved')
    expect(transformNotionToInvoice(rejectedPage, []).status).toBe('rejected')
  })

  test('알 수 없는 상태일 때 "pending"을 사용한다', () => {
    const invoicePage = createMockInvoicePage({
      상태: { type: 'status', status: { name: '알 수 없음' } },
    })

    const result = transformNotionToInvoice(invoicePage, [])

    expect(result.status).toBe('pending')
  })

  test('항목 데이터를 올바르게 변환한다', () => {
    const invoicePage = createMockInvoicePage()
    const itemPages = [
      createMockItemPage({
        항목명: { type: 'title', title: [{ plain_text: '모바일 앱 개발' }] },
        수량: { type: 'number', number: 3 },
        단가: { type: 'number', number: 5000000 },
        금액: { type: 'number', number: 15000000 },
      }),
    ]

    const result = transformNotionToInvoice(invoicePage, itemPages)

    expect(result.items[0]).toEqual({
      id: 'item-page-id-456',
      description: '모바일 앱 개발',
      quantity: 3,
      unitPrice: 5000000,
      amount: 15000000,
    })
  })

  test('항목의 금액이 없을 때 수량 × 단가로 계산한다', () => {
    const invoicePage = createMockInvoicePage()
    const itemPages = [
      createMockItemPage({
        수량: { type: 'number', number: 5 },
        단가: { type: 'number', number: 100000 },
        금액: { type: 'number', number: null },
      }),
    ]

    const result = transformNotionToInvoice(invoicePage, itemPages)

    expect(result.items[0].amount).toBe(500000)
  })

  test('항목명이 없을 때 "항목명 없음"을 사용한다', () => {
    const invoicePage = createMockInvoicePage()
    const itemPages = [
      createMockItemPage({
        항목명: { type: 'title', title: [] },
      }),
    ]

    const result = transformNotionToInvoice(invoicePage, itemPages)

    expect(result.items[0].description).toBe('항목명 없음')
  })
})

describe('normalizeDate', () => {
  test('유효한 날짜 문자열을 ISO 8601 형식으로 변환한다', () => {
    expect(normalizeDate('2025-10-07')).toBe('2025-10-07')
    expect(normalizeDate('2025-01-01')).toBe('2025-01-01')
  })

  test('null이나 undefined일 때 현재 날짜를 반환한다', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(normalizeDate(null)).toBe(today)
    expect(normalizeDate(undefined)).toBe(today)
  })

  test('유효하지 않은 날짜일 때 현재 날짜를 반환한다', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(normalizeDate('invalid-date')).toBe(today)
  })

  test('다양한 날짜 형식을 처리한다', () => {
    expect(normalizeDate('2025-10-07T10:30:00.000Z')).toBe('2025-10-07')
    // '2025/10/07'은 시스템 시간대에 따라 다를 수 있으므로 형식만 확인
    const result = normalizeDate('2025/10/07')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('parseNumber', () => {
  test('숫자 값을 그대로 반환한다', () => {
    expect(parseNumber(100)).toBe(100)
    expect(parseNumber(0)).toBe(0)
    expect(parseNumber(-50)).toBe(-50)
    expect(parseNumber(123.45)).toBe(123.45)
  })

  test('숫자 문자열을 파싱한다', () => {
    expect(parseNumber('100')).toBe(100)
    expect(parseNumber('123.45')).toBe(123.45)
    expect(parseNumber('-50')).toBe(-50)
  })

  test('유효하지 않은 값일 때 기본값을 반환한다', () => {
    expect(parseNumber('not a number')).toBe(0)
    expect(parseNumber(null)).toBe(0)
    expect(parseNumber(undefined)).toBe(0)
    expect(parseNumber(NaN)).toBe(0)
  })

  test('커스텀 기본값을 사용한다', () => {
    expect(parseNumber('invalid', 999)).toBe(999)
    expect(parseNumber(null, -1)).toBe(-1)
  })
})
