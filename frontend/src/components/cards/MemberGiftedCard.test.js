import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberGiftedCard from './MemberGiftedCard';
import { formatDate } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

jest.mock('../../utils/fetchWithRefresh');
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key.split('.').pop() }),
}));

jest.mock('../layout/CardMember', () => ({ children, onEdit, emptyMessage }) => (
    <div>
        <button onClick={onEdit}>Edit</button>
        {children}
        {emptyMessage && <div>{emptyMessage}</div>}
    </div>
));

jest.mock('../layout/MemberDetail', () => ({ label, value }) => (
    <div>{label}: {value}</div>
));

describe('MemberGiftedCard', () => {
    const mockOnEdit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const giftsData = [
        { gift_id: 1, name: 'Gift 1', expires_at: '2025-10-01' },
        { gift_id: 2, name: 'Gift 2', expires_at: '2025-11-15' },
    ];

    it('renders gifts correctly', () => {
        render(<MemberGiftedCard id={1} data={giftsData} onEdit={mockOnEdit} />);

        giftsData.forEach(gift => {
            expect(screen.getByText(`name: ${gift.name}`)).toBeInTheDocument();
            expect(screen.getByText(`expires_at: ${formatDate(gift.expires_at)}`)).toBeInTheDocument();
        });
    });

    it('renders empty state when no gifts', () => {
        render(<MemberGiftedCard id={1} data={[]} onEdit={mockOnEdit} />);
        expect(screen.getByText('no_gifts')).toBeInTheDocument();
    });

    it('calls onEdit with fetchData when edit button is clicked', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ gift_id: 3, name: 'Gift 3', expires_at: '2025-12-01' }]
        });

        render(<MemberGiftedCard id={1} data={giftsData} onEdit={mockOnEdit} />);

        fireEvent.click(screen.getByText('Edit'));

        expect(mockOnEdit).toHaveBeenCalled();
        const args = mockOnEdit.mock.calls[0];
        expect(args[0]).toBe('gifteds');
        expect(typeof args[1].fetchData).toBe('function');

        // test fetchData result
        const fetchedData = await args[1].fetchData();
        expect(fetchedData.some(g => g.name === 'Gift 3')).toBe(true);
    });

    it('does not call onEdit when gifts array is empty', () => {
        render(<MemberGiftedCard id={1} data={[]} onEdit={mockOnEdit} />);
        fireEvent.click(screen.getByText('Edit'));
        expect(mockOnEdit).not.toHaveBeenCalled();
    });
});