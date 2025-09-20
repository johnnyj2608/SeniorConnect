import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SupportsPage from './SupportsPage';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en' },
    }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useParams: () => ({ section: 'getting-started' }),
    useNavigate: () => mockNavigate,
}));

jest.mock('../data/en/getting-started.json', () => ({
    title: 'Getting Started',
    date: '2025-01-01',
    introduction: 'Welcome to the guide.',
    sections: [
        {
            title: 'Section 1',
            content: 'Content of section 1',
            articles: [
                { question: 'Q1?', answer: 'A1' },
                { question: 'Q2?', answer: 'A2' },
            ],
        },
        {
            title: 'Section 2',
            content: 'Content of section 2',
        },
    ],
}), { virtual: true });

describe('SupportsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders page header and title', () => {
        render(<SupportsPage />);
        expect(screen.getByText((content) => content.includes('settings.support.label'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('settings.support.label')).closest('h2')).toBeInTheDocument();
    });

    it('renders main support content from JSON', () => {
        render(<SupportsPage />);
        expect(screen.getByText('Getting Started')).toBeInTheDocument();
        expect(screen.getByText('2025-01-01')).toBeInTheDocument();
        expect(screen.getByText('Welcome to the guide.')).toBeInTheDocument();
    });

    it('renders all sections and articles', () => {
        render(<SupportsPage />);
        // Sections
        expect(screen.getByText('Section 1')).toBeInTheDocument();
        expect(screen.getByText('Content of section 1')).toBeInTheDocument();
        expect(screen.getByText('Section 2')).toBeInTheDocument();
        expect(screen.getByText('Content of section 2')).toBeInTheDocument();

        // Articles
        expect(screen.getByText('Q: Q1?')).toBeInTheDocument();
        expect(screen.getByText('A: A1')).toBeInTheDocument();
        expect(screen.getByText('Q: Q2?')).toBeInTheDocument();
        expect(screen.getByText('A: A2')).toBeInTheDocument();
    });

    it('navigates back when back button is clicked', () => {
        render(<SupportsPage />);
        const backButton = screen.getByText((content) => content.includes('general.buttons.back'));
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });
});
