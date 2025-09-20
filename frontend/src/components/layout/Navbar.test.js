import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';
import { MemoryRouter } from 'react-router';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

jest.mock('../../assets/menu.svg', () => ({
    ReactComponent: () => <svg />,
}));

describe('Navbar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders header and toggle button', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(screen.getByText('Senior Connect')).toBeInTheDocument();
        const toggleBtn = document.querySelector('.navbar-toggle');
        expect(toggleBtn).toBeInTheDocument();
    });

    it('opens and closes nav links when toggle button is clicked', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        const toggleBtn = document.querySelector('.navbar-toggle');
        const navLinksContainer = document.querySelector('.nav-links');

        // Initially closed
        expect(navLinksContainer).not.toHaveClass('open');

        // Open
        fireEvent.click(toggleBtn);
        expect(navLinksContainer).toHaveClass('open');

        // Close
        fireEvent.click(toggleBtn);
        expect(navLinksContainer).not.toHaveClass('open');
    });

    it('navigates to correct path when a nav link is clicked and closes menu', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        const toggleBtn = document.querySelector('.navbar-toggle');
        const navLinksContainer = document.querySelector('.nav-links');
        fireEvent.click(toggleBtn);

        const membersButton = screen.getByText('general.members').closest('button');
        fireEvent.click(membersButton);

        expect(mockNavigate).toHaveBeenCalledWith('/members');
        expect(navLinksContainer).not.toHaveClass('open');
    });
});
