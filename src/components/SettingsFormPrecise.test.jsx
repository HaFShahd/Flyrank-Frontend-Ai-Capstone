import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { test, vi, expect } from 'vitest'
import SettingsFormPrecise from './SettingsFormPrecise'

test('shows validation errors and submits valid data', async () => {
  const onSave = vi.fn()
  render(<SettingsFormPrecise onSave={onSave} />)

  // Submit without filling fields
  fireEvent.click(screen.getByRole('button', { name: /save settings/i }))

  expect(await screen.findByText(/Username must be at least 3 characters/i)).toBeTruthy()
  expect(await screen.findByText(/Invalid email address/i)).toBeTruthy()
  expect(await screen.findByText(/Timezone is required/i)).toBeTruthy()

  // Fill with valid inputs
  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'Alice' } })
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@example.com' } })
  fireEvent.change(screen.getByLabelText(/timezone/i), { target: { value: 'UTC' } })

  fireEvent.click(screen.getByRole('button', { name: /save settings/i }))

  // onSave should be called with data
  expect(onSave).toHaveBeenCalled()
  const calledWith = onSave.mock.calls[0][0]
  expect(calledWith.username).toBe('Alice')
  expect(calledWith.email).toBe('alice@example.com')
  expect(calledWith.timezone).toBe('UTC')
})
