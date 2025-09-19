import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import EditButton from './EditButton'

describe('EditButton', () => {
    it('renders the button', () => {
        render(<EditButton />)
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
    })

    it('calls onClick when clicked', async () => {
        const handleClick = jest.fn()
        render(<EditButton onClick={handleClick} />)
        const button = screen.getByRole('button')
        await userEvent.click(button)
        expect(handleClick).toHaveBeenCalledTimes(1)
    })
})
