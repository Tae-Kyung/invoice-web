import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PDFDownloadButton } from '@/components/invoice/PDFDownloadButton'
import type { Invoice } from '@/types/invoice'

// toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// 테스트용 모의 견적서 데이터
const mockInvoice: Invoice = {
  id: 'test-invoice-1',
  invoiceNumber: 'INV-2025-001',
  clientName: 'ABC 회사',
  issueDate: '2025-01-15',
  validUntil: '2025-01-22',
  totalAmount: 5000000,
  status: 'pending',
  items: [
    {
      id: 'item-1',
      description: '웹사이트 디자인',
      quantity: 1,
      unitPrice: 3000000,
      amount: 3000000,
    },
  ],
}

// fetch 모킹
const mockFetch = vi.fn()
global.fetch = mockFetch

// URL 객체 모킹
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('PDFDownloadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('컴포넌트가 정상적으로 렌더링된다', () => {
    render(<PDFDownloadButton invoice={mockInvoice} />)

    const button = screen.getByRole('button', { name: /PDF 다운로드/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('PDF 다운로드')
  })

  test('버튼 클릭 시 API를 호출한다', async () => {
    const user = userEvent.setup()

    // fetch 성공 응답 모킹
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(['mock pdf'], { type: 'application/pdf' }),
    })

    render(<PDFDownloadButton invoice={mockInvoice} />)

    const button = screen.getByRole('button', { name: /PDF 다운로드/i })
    await user.click(button)

    // fetch가 호출되었는지 확인
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate-pdf',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoice: mockInvoice }),
        })
      )
    })
  })

  test('PDF 생성 실패 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    const { toast } = await import('sonner')

    // fetch 실패 응답 모킹
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    render(<PDFDownloadButton invoice={mockInvoice} />)

    const button = screen.getByRole('button', { name: /PDF 다운로드/i })
    await user.click(button)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'PDF 생성 중 오류가 발생했습니다.'
      )
    })
  })

  test('다양한 size prop을 받을 수 있다', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const

    sizes.forEach((size) => {
      const { unmount } = render(
        <PDFDownloadButton invoice={mockInvoice} size={size} />
      )
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      unmount()
    })
  })

  test('커스텀 className이 적용된다', () => {
    render(<PDFDownloadButton invoice={mockInvoice} className="custom-class" />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  test('aria 속성이 올바르게 설정된다', () => {
    render(<PDFDownloadButton invoice={mockInvoice} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'PDF 다운로드')
    expect(button).toHaveAttribute('aria-busy', 'false')
    expect(button).toHaveAttribute('aria-live', 'polite')
  })

  test('Download 아이콘이 표시된다', () => {
    const { container } = render(<PDFDownloadButton invoice={mockInvoice} />)

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('h-4', 'w-4')
  })

  test('로딩 상태일 때 버튼이 비활성화된다', async () => {
    const user = userEvent.setup()

    // fetch가 지연되도록 설정
    let resolvePromise: (value: Partial<Response>) => void
    const promise = new Promise<Partial<Response>>((resolve) => {
      resolvePromise = resolve
    })

    mockFetch.mockReturnValueOnce(promise)

    render(<PDFDownloadButton invoice={mockInvoice} />)

    const button = screen.getByRole('button', { name: /PDF 다운로드/i })
    await user.click(button)

    // 로딩 중 버튼 상태 확인
    await waitFor(() => {
      expect(screen.getByText('PDF 생성 중...')).toBeInTheDocument()
    })

    const loadingButton = screen.getByRole('button', { name: /PDF 생성 중/i })
    expect(loadingButton).toBeDisabled()

    // Promise 해결
    resolvePromise!({
      ok: true,
      blob: async () => new Blob(['mock pdf']),
    })
  })
})
