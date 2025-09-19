import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchMembers from './SearchMembers';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

jest.mock('../../utils/fetchWithRefresh');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key }),
}));

describe('SearchMembers', () => {
    let handleChange;
    let handleSelect;

    const mockMembers = [
        { id: 1, first_name: 'John', last_name: 'Doe', sadc_member_id: 101 },
        { id: 2, first_name: 'Jane', last_name: 'Smith', alt_name: 'Janie', sadc_member_id: 102 },
        { id: 3, first_name: 'Bob', last_name: 'Brown', sadc_member_id: 103 },
        { id: 4, first_name: null, last_name: null, alt_name: null, sadc_member_id: 104 }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        handleChange = jest.fn();
        handleSelect = jest.fn();

        fetchWithRefresh.mockResolvedValue({
            ok: true,
            json: async () => mockMembers
        });
    });

    it('renders input with correct placeholder', () => {
        render(<SearchMembers value="" onChange={handleChange} onSelect={handleSelect} />);
        const input = screen.getByPlaceholderText('members.search_id_or_name');
        expect(input).toBeInTheDocument();
    });

    it('calls onChange when typing into input', () => {
        render(<SearchMembers value="" onChange={handleChange} onSelect={handleSelect} />);
        const input = screen.getByPlaceholderText('members.search_id_or_name');

        fireEvent.change(input, { target: { value: 'Jane' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange.mock.calls[0][0]).toBe('Jane');
    });

    it('fetches members and displays matching results', async () => {
        render(<SearchMembers value="Jane" onChange={handleChange} onSelect={handleSelect} />);

        await waitFor(() => {
            const suggestion = screen.getByText(
                (content, element) =>
                    element.tagName.toLowerCase() === 'li' &&
                    content.includes('102') &&
                    content.includes('Jane') &&
                    content.includes('Smith') &&
                    content.includes('Janie')
            );
            expect(suggestion).toBeInTheDocument();
        });
    });

    it('calls onSelect and clears suggestions when a result is clicked', async () => {
        render(<SearchMembers value="Jane" onChange={handleChange} onSelect={handleSelect} />);
        const input = screen.getByPlaceholderText('members.search_id_or_name');
        fireEvent.change(input, { target: { value: 'Jane' } });

        let suggestion;
        await waitFor(() => {
            suggestion = screen.getByText(
                (content, element) =>
                    element.tagName.toLowerCase() === 'li' &&
                    content.includes('102') &&
                    content.includes('Jane')
            );
            expect(suggestion).toBeInTheDocument();
        });

        fireEvent.click(suggestion);
        expect(handleSelect).toHaveBeenCalledWith(mockMembers[1]);

        await waitFor(() => {
            expect(screen.queryByText('Jane')).not.toBeInTheDocument();
        });
    });

    it('filters members based on multiple terms', async () => {
        render(<SearchMembers value="Jane Smith" onChange={handleChange} onSelect={handleSelect} />);

        await waitFor(() => {
            const suggestion = screen.getByText(
                (content, element) =>
                    element.tagName.toLowerCase() === 'li' &&
                    content.includes('Jane') &&
                    content.includes('Smith')
            );
            expect(suggestion).toBeInTheDocument();
        });

        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('handles members with null or missing fields', async () => {
        render(<SearchMembers value="104" onChange={handleChange} onSelect={handleSelect} />);

        await waitFor(() => {
            const suggestion = screen.getByText(
                (content, element) =>
                    element.tagName.toLowerCase() === 'li' &&
                    content.includes('104')
            );
            expect(suggestion).toBeInTheDocument();
        });
    });

    it('does not crash when fetch fails', async () => {
        fetchWithRefresh.mockRejectedValueOnce(new Error('Network error'));
        render(<SearchMembers value="Jane" onChange={handleChange} onSelect={handleSelect} />);

        await waitFor(() => {
            expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
        });
    });

    it('trims input and ignores case when filtering', async () => {
        render(<SearchMembers value=" jAnE " onChange={handleChange} onSelect={handleSelect} />);
        
        await waitFor(() => {
            const suggestion = screen.getByText(
                (content, element) =>
                    element.tagName.toLowerCase() === 'li' &&
                    content.includes('Jane')
            );
            expect(suggestion).toBeInTheDocument();
        });
    });
});