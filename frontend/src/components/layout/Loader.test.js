import React from 'react';
import { render, screen } from '@testing-library/react';

import Loader from './Loader';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('Loader', () => {
    it('renders the loading container with spinner', () => {
        render(<Loader />);
        const container = screen.getByRole('status');
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass('loading-container');

        const spinner = container.querySelector('.spinner');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders the translated loading text', () => {
        render(<Loader />);
        expect(screen.getByText('general.loading...')).toBeInTheDocument();
    });
});