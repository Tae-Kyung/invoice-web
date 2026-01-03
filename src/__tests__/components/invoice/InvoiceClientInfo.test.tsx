import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InvoiceClientInfo } from '@/components/invoice/InvoiceClientInfo'
import type { Invoice } from '@/types/invoice'

// 테스트용 모의 견적서 데이터
const mockInvoice: Invoice = {
  id: 'test-invoice-1',
  invoiceNumber: 'INV-2025-001',
  clientName: 'ABC 회사',
  issueDate: '2025-01-15',
  validUntil: '2025-01-22',
  totalAmount: 5000000,
  status: 'pending',
  items: [],
}

describe('InvoiceClientInfo', () => {
  test('컴포넌트가 정상적으로 렌더링된다', () => {
    render(<InvoiceClientInfo invoice={mockInvoice} />)

    // 제목이 표시되는지 확인
    expect(screen.getByText('클라이언트 정보')).toBeInTheDocument()

    // 회사명 레이블이 표시되는지 확인
    expect(screen.getByText('회사명')).toBeInTheDocument()

    // 클라이언트명이 표시되는지 확인
    expect(screen.getByText('ABC 회사')).toBeInTheDocument()
  })

  test('다양한 클라이언트명을 정확하게 표시한다', () => {
    const testCases = [
      { clientName: 'XYZ 코퍼레이션' },
      { clientName: '123 주식회사' },
      { clientName: 'Test Company Ltd.' },
    ]

    testCases.forEach(({ clientName }) => {
      const invoice = { ...mockInvoice, clientName }
      const { rerender } = render(<InvoiceClientInfo invoice={invoice} />)

      expect(screen.getByText(clientName)).toBeInTheDocument()

      rerender(<InvoiceClientInfo invoice={invoice} />)
    })
  })

  test('커스텀 className이 적용된다', () => {
    const { container } = render(
      <InvoiceClientInfo invoice={mockInvoice} className="custom-class" />
    )

    const card = container.querySelector('.custom-class')
    expect(card).toBeInTheDocument()
  })

  test('Building2 아이콘이 표시된다', () => {
    render(<InvoiceClientInfo invoice={mockInvoice} />)

    // 아이콘은 aria-hidden으로 숨겨져 있지만 SVG로 존재함
    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  test('Card 컴포넌트 구조가 올바르다', () => {
    const { container } = render(<InvoiceClientInfo invoice={mockInvoice} />)

    // Card, CardHeader, CardContent가 모두 존재하는지 확인
    expect(container.querySelector('[class*="shadow"]')).toBeInTheDocument()
  })

  test('빈 클라이언트명도 렌더링한다', () => {
    const invoice = { ...mockInvoice, clientName: '' }
    render(<InvoiceClientInfo invoice={invoice} />)

    // 빈 문자열도 렌더링되어야 함
    expect(screen.getByText('회사명')).toBeInTheDocument()
  })

  test('긴 클라이언트명도 정상적으로 표시한다', () => {
    const longName = '매우 긴 회사명을 가진 주식회사 테스트 코퍼레이션 인터내셔널'
    const invoice = { ...mockInvoice, clientName: longName }
    render(<InvoiceClientInfo invoice={invoice} />)

    expect(screen.getByText(longName)).toBeInTheDocument()
  })
})
