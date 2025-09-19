import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import SwitchButton from './SwitchButton'

describe('SwitchButton', () => {
    it('renders the button', () => {
        render(<SwitchButton />)
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
    })

    it('calls onClick when clicked', async () => {
        const handleClick = jest.fn()
        render(<SwitchButton onClick={handleClick} />)
        const button = screen.getByRole('button')
        await userEvent.click(button)
        expect(handleClick).toHaveBeenCalledTimes(1)
    })
})
