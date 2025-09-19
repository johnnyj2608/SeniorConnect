import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import AttendanceButton from './AttendanceButton'

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}))

describe('AttendanceButton', () => {
    it('renders the button ', () => {
        render(<AttendanceButton />)
        const button = screen.getByRole('button', { name: /general.buttons.attendance_sheets/i })
        expect(button).toBeInTheDocument()
    })

    it('calls onClick when clicked', async () => {
        const handleClick = jest.fn()
        render(<AttendanceButton onClick={handleClick} />)
        const button = screen.getByRole('button', { name: /general.buttons.attendance_sheets/i })
        await userEvent.click(button)
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('respects the disabled prop', () => {
        render(<AttendanceButton disabled />)
        const button = screen.getByRole('button', { name: /general.buttons.attendance_sheets/i })
        expect(button).toBeDisabled()
    })
})