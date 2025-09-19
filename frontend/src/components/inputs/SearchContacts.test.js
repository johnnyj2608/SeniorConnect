import React, { useState } from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import SearchContacts from './SearchContacts';
import { formatPhone, normalizeField } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

jest.mock('../../utils/fetchWithRefresh');
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key }),
}));

const Wrapper = ({ initialValue = '', contactType = 'phone', memberId = 1, onSelect, disabled }) => {
    const [value, setValue] = useState(initialValue);
    return (
        <SearchContacts
            value={value}
            onChange={e => setValue(e.target.value)}
            contactType={contactType}
            memberId={memberId}
            onSelect={onSelect}
            disabled={disabled}
        />
    );
};

describe('SearchContacts', () => {
    beforeEach(() => {
        fetchWithRefresh.mockReset();
    });

    it('calls onChange and updates input', () => {
        const handleSelect = jest.fn();
        render(<Wrapper onSelect={handleSelect} />);
        const input = screen.getByRole('textbox');

        fireEvent.change(input, { target: { value: 'Alice' } });

        expect(input.value).toBe('Alice');
    });

    it('fetches and displays suggestions', async () => {
        const handleSelect = jest.fn();
        fetchWithRefresh.mockResolvedValue({
            ok: true,
            json: async () => [{ name: 'Alice', phone: '123456' }],
        });

        render(<Wrapper initialValue="" onSelect={handleSelect} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Ali' } });

        await waitFor(() => {
            const item = screen.getByRole('listitem');
            expect(item).toBeInTheDocument();
            expect(item.textContent).toContain('Alice');
            expect(item.textContent).toContain(formatPhone('123456'));
        });

        expect(fetchWithRefresh).toHaveBeenCalledWith(
            expect.stringContaining(`contact_type=${normalizeField('phone')}`)
        );
    });

    it('calls onSelect when suggestion clicked', async () => {
        const handleSelect = jest.fn();
        fetchWithRefresh.mockResolvedValue({
            ok: true,
            json: async () => [{ name: 'Alice', phone: '123456' }],
        });

        render(<Wrapper initialValue="" onSelect={handleSelect} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Ali' } });

        const item = await screen.findByRole('listitem');
        fireEvent.click(item);

        expect(handleSelect).toHaveBeenCalledWith({ name: 'Alice', phone: '123456' });
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    it('does not allow typing when input is disabled', () => {
        const handleSelect = jest.fn();
        render(<Wrapper onSelect={handleSelect} disabled />);
        const input = screen.getByRole('textbox');

        expect(input).toBeDisabled();
    });

    it('handles empty fetch results gracefully', async () => {
        const handleSelect = jest.fn();
        fetchWithRefresh.mockResolvedValue({ ok: true, json: async () => [] });

        render(<Wrapper initialValue="" onSelect={handleSelect} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Ali' } });

        await waitFor(() => {
            expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
        });
    });

    it('handles fetch failure gracefully', async () => {
        const handleSelect = jest.fn();
        fetchWithRefresh.mockRejectedValue(new Error('Network error'));

        render(<Wrapper initialValue="" onSelect={handleSelect} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Ali' } });

        await waitFor(() => {
            expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
        });
    });
});