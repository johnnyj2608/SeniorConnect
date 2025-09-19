import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import '@testing-library/jest-dom'
import AddButton from './AddButton'

describe('AddButton component', () => {
    it('renders the link with the correct href and accessible name', () => {
        render(
            <MemoryRouter>
                <AddButton />
            </MemoryRouter>
        )

        const link = screen.getByRole('link', { name: /add member/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/members/new')
    })
})
