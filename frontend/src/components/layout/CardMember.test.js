import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import CardMember from './CardMember';

jest.mock('../buttons/EditButton', () => ({ onClick }) => (
    <button onClick={onClick}>Edit</button>
));

describe('CardMember', () => {
    const mockOnEdit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with default card-400 and switches to card-full when fullWidth is true', () => {
        const { rerender } = render(
            <CardMember title="Test" data={{}} emptyMessage="Empty" />
        );
        expect(screen.getByText('Test').closest('div')).toHaveClass('card-400');

        rerender(<CardMember title="Full" data={{}} emptyMessage="Empty" fullWidth />);
        expect(screen.getByText('Full').closest('div')).toHaveClass('card-full');
    });

    it('renders children when data is provided, otherwise shows emptyMessage', () => {
        const { rerender } = render(
            <CardMember title="Has Data" data={{ foo: 'bar' }} emptyMessage="Empty">
                <div>Child Content</div>
            </CardMember>
        );
        expect(screen.getByText('Child Content')).toBeInTheDocument();

        rerender(<CardMember title="No Data" data={{}} emptyMessage="No content" />);
        expect(screen.getByText('No content')).toBeInTheDocument();
    });

    it('renders Edit button and calls onEdit with key + data', () => {
        const testData = { foo: 'bar' };
        render(
            <CardMember
                title="Editable"
                data={testData}
                emptyMessage="Empty"
                onEdit={mockOnEdit}
                editKey="profile"
            />
        );
        fireEvent.click(screen.getByText('Edit'));
        expect(mockOnEdit).toHaveBeenCalledWith('profile', { data: testData });
    });

    it('does not render Edit button if onEdit or editKey is missing', () => {
        const { rerender } = render(
            <CardMember title="No OnEdit" data={{ foo: 'bar' }} emptyMessage="Empty" editKey="test" />
        );
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();

        rerender(
            <CardMember title="No EditKey" data={{ foo: 'bar' }} emptyMessage="Empty" onEdit={mockOnEdit} />
        );
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
});