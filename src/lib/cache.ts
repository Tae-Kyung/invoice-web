/**
 * Next.js 캐싱 유틸리티
 * unstable_cache를 사용한 Notion API 응답 캐싱 및 Request Deduplication 구현
 */

import { unstable_cache } from 'next/cache'
import type { Invoice } from '@/types/invoice'
import type { InvoiceListResult } from '@/lib/services/invoice.service'

/**
 * 캐싱 설정 상수
 */
export const CACHE_CONFIG = {
  /** 단일 견적서 캐시 재검증 시간 (초) - 5분마다 캐시 갱신 */
  INVOICE_REVALIDATE: 300,
  /** 견적서 목록 캐시 재검증 시간 (초) - 2분마다 캐시 갱신 */
  INVOICE_LIST_REVALIDATE: 120,
  /** 캐시 태그 - revalidateTag로 특정 캐시 무효화 시 사용 */
  INVOICE_TAGS: ['invoice'],
  INVOICE_LIST_TAGS: ['invoice-list'],
} as const

/**
 * 견적서 조회 함수를 캐싱 기능이 추가된 함수로 래핑
 * Next.js의 unstable_cache를 사용하여 Notion API 응답을 캐싱합니다.
 *
 * @param fetcher - 원본 견적서 조회 함수
 * @returns 캐싱이 적용된 견적서 조회 함수
 *
 * @example
 * ```typescript
 * const cachedFetcher = createCachedInvoiceFetcher(getInvoiceFromNotion)
 * const invoice = await cachedFetcher(pageId)
 * ```
 */
export function createCachedInvoiceFetcher(
  fetcher: (pageId: string) => Promise<Invoice>
) {
  return unstable_cache(
    async (pageId: string) => {
      return await fetcher(pageId)
    },
    ['invoice'], // 캐시 키 배열
    {
      revalidate: CACHE_CONFIG.INVOICE_REVALIDATE, // 5분 후 재검증
      tags: [...CACHE_CONFIG.INVOICE_TAGS], // 태그 기반 무효화
    }
  )
}

/**
 * 견적서 목록 조회 함수를 캐싱 기능이 추가된 함수로 래핑
 * unstable_cache를 사용하여 Notion API 목록 조회를 캐싱합니다.
 *
 * @param fetcher - 원본 견적서 목록 조회 함수
 * @returns 캐싱이 적용된 견적서 목록 조회 함수
 *
 * @example
 * ```typescript
 * const cachedListFetcher = createCachedInvoiceListFetcher(getInvoicesFromNotion)
 * const result = await cachedListFetcher(10, undefined, 'issue_date')
 * ```
 */
export function createCachedInvoiceListFetcher(
  fetcher: (
    pageSize: number,
    startCursor?: string,
    sortBy?: 'issue_date' | 'total_amount'
  ) => Promise<InvoiceListResult>
) {
  return unstable_cache(
    async (
      pageSize: number,
      startCursor?: string,
      sortBy?: 'issue_date' | 'total_amount'
    ) => {
      return await fetcher(pageSize, startCursor, sortBy)
    },
    ['invoice-list'], // 캐시 키 배열
    {
      revalidate: CACHE_CONFIG.INVOICE_LIST_REVALIDATE, // 2분 후 재검증
      tags: [...CACHE_CONFIG.INVOICE_LIST_TAGS], // 태그 기반 무효화
    }
  )
}

/**
 * Request Deduplication을 위한 진행 중인 요청 추적 맵
 * 동일한 pageId에 대한 동시 요청이 발생할 경우 하나의 요청만 실행하고
 * 나머지는 동일한 Promise를 공유하여 중복 API 호출을 방지합니다.
 */
const pendingRequests = new Map<string, Promise<Invoice>>()

/**
 * Request Deduplication이 적용된 견적서 조회
 * 동일한 pageId에 대한 동시 요청 시 하나의 API 호출만 실행됩니다.
 *
 * @param pageId - 견적서 페이지 ID
 * @param fetcher - 견적서 조회 함수 (캐싱이 적용된 함수 권장)
 * @returns Invoice 객체
 *
 * @example
 * ```typescript
 * // 여러 컴포넌트에서 동시에 호출해도 실제 API 호출은 1회만 발생
 * const invoice1 = getInvoiceWithDedup(pageId, cachedFetcher)
 * const invoice2 = getInvoiceWithDedup(pageId, cachedFetcher)
 * ```
 */
export async function getInvoiceWithDedup(
  pageId: string,
  fetcher: (pageId: string) => Promise<Invoice>
): Promise<Invoice> {
  // 이미 진행 중인 요청이 있으면 그 Promise를 반환
  if (pendingRequests.has(pageId)) {
    const existingPromise = pendingRequests.get(pageId)!
    return existingPromise
  }

  // 새로운 요청 시작
  const promise = fetcher(pageId)
  pendingRequests.set(pageId, promise)

  try {
    const result = await promise
    return result
  } finally {
    // 요청 완료 후 맵에서 제거 (성공/실패 모두)
    pendingRequests.delete(pageId)
  }
}
