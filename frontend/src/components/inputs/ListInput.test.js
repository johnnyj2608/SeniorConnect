import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListInput from './ListInput';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key }),
}));

describe('ListInput', () => {
    let handleChange;

    beforeEach(() => {
        handleChange = jest.fn();
    });

    it('renders all items correctly', () => {
        const data = ['Item 1', 'Item 2'];
        render(<ListInput data={data} onChange={handleChange} />);
        
        data.forEach(item => {
            expect(screen.getByDisplayValue(item)).toBeInTheDocument();
        });
    });

    it('calls onChange when an item is edited', () => {
        const data = ['Item 1', 'Item 2'];
        render(<ListInput data={data} onChange={handleChange} />);
        
        const input = screen.getByDisplayValue('Item 1');
        fireEvent.change(input, { target: { value: 'Updated Item 1' } });

        expect(handleChange).toHaveBeenCalledWith({
            target: { value: ['Updated Item 1', 'Item 2'] }
        });
    });

    it('adds a new item when add button is clicked', () => {
        const data = ['Item 1'];
        render(<ListInput data={data} onChange={handleChange} />);
        
        const addButton = screen.getByText('settings.admin.click_to_add_more');
        fireEvent.click(addButton);

        expect(handleChange).toHaveBeenCalledWith({
            target: { value: ['Item 1', ''] }
        });
    });

    it('removes an item when remove button is clicked', () => {
        const data = ['Item 1', 'Item 2'];
        render(<ListInput data={data} onChange={handleChange} />);
        
        const removeButtons = screen.getAllByText('—');
        fireEvent.click(removeButtons[0]);

        expect(handleChange).toHaveBeenCalledWith({
            target: { value: ['Item 2'] }
        });
    });

    it('disables inputs and remove buttons when disabled prop is true', () => {
        const data = ['Item 1'];
        render(<ListInput data={data} onChange={handleChange} disabled={true} />);
        
        const input = screen.getByDisplayValue('Item 1');
        const removeButton = screen.getByText('—');

        expect(input).toBeDisabled();
        expect(removeButton).toBeDisabled();
        expect(screen.queryByText('settings.admin.click_to_add_more')).not.toBeInTheDocument();
    });

    it('handles empty data gracefully', () => {
        render(<ListInput data={[]} onChange={handleChange} />);
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.getByText('settings.admin.click_to_add_more')).toBeInTheDocument();
    });
});