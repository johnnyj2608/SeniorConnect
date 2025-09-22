import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DropdownButton from './DropdownButton'

describe('DropdownButton', () => {
    it('renders the button', () => {
        render(<DropdownButton />)
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
    })

    it('adds "open" class when showDetails is true', () => {
        render(<DropdownButton showDetails />)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('open')
    })

    it('does not have "open" class when showDetails is false', () => {
        render(<DropdownButton showDetails={false} />)
        const button = screen.getByRole('button')
        expect(button).not.toHaveClass('open')
    })

    it('calls toggleDetails on click', async () => {
        const handleClick = jest.fn()
        render(<DropdownButton toggleDetails={handleClick} />)
        const button = screen.getByRole('button')
        await userEvent.click(button)
        expect(handleClick).toHaveBeenCalledTimes(1)
    })
})
