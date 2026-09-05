import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, test, expect } from 'vitest'

vi.mock('../lib/assistant', () => ({ getAssistantReply: vi.fn() }))
import { getAssistantReply } from '../lib/assistant'
import ChatUI from '../components/ChatUI'

test('chat flow displays bot reply', async () => {
  ;(getAssistantReply as unknown as any).mockResolvedValue('Procedure: step1')
  render(<ChatUI />)

  const input = screen.getByLabelText(/Ask about subsidies or steps to apply/i)
  fireEvent.change(input, { target: { value: 'How to apply for Punjab Kissan Support' } })
  fireEvent.click(screen.getByRole('button', { name: /send/i }))

  expect(await screen.findByText(/Procedure: step1/i)).toBeInTheDocument()
})
