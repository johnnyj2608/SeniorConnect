import React from 'react';
import { render, screen } from '@testing-library/react';
import CardHome from './CardHome';

describe('CardHome', () => {
    it('renders title and empty message when no data', () => {
        render(<CardHome title="Test Title" data={[]} emptyMessage="No data available" />);

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders children when data is provided', () => {
        render(
            <CardHome title="With Data" data={[1, 2, 3]}>
                <div>Child Content</div>
            </CardHome>
        );

        expect(screen.getByText('With Data')).toBeInTheDocument();
        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
});