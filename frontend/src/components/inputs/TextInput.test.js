import React, { useState } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TextInput from './TextInput';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key }),
}));

describe('TextInput', () => {
    let handleLimitExceeded;

    beforeEach(() => {
        handleLimitExceeded = jest.fn();
    });

    it('renders label with asterisk when required', () => {
        render(<TextInput label="Name" value="" onChange={() => {}} required />);
        expect(screen.getByText(/Name \*/)).toBeInTheDocument();
    });

    it('calls onChange when typing', () => {
        const Wrapper = () => {
            const [value, setValue] = useState('');
            return <TextInput label="Name" value={value} onChange={(e) => setValue(e.target.value)} />;
        };

        render(<Wrapper />);
        const input = screen.getByRole('textbox');

        fireEvent.change(input, { target: { value: 'Jane' } });
        expect(input).toHaveValue('Jane');
    });

    it('prevents invalid characters for number type', () => {
        const Wrapper = () => {
            const [value, setValue] = useState('');
            return <TextInput label="Age" value={value} onChange={(e) => setValue(e.target.value)} type="number" />;
        };

        render(<Wrapper />);
        const input = screen.getByRole('spinbutton');

        const invalidKeys = ['e', 'E', '+', '-'];
        invalidKeys.forEach((key) => {
            const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
            const prevented = !input.dispatchEvent(event); // true if preventDefault called
            expect(prevented).toBe(true);
        });
    });

    it('shows disabled value when showDisabled is true', () => {
        render(
            <TextInput
                label="Disabled"
                value="fixed"
                onChange={() => {}}
                disabled
                showDisabled
            />
        );
        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('fixed');
        expect(input).toBeDisabled();
    });

    it('hides value when disabled without showDisabled', () => {
        render(
            <TextInput
                label="Hidden"
                value="secret"
                onChange={() => {}}
                disabled
            />
        );
        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('');
        expect(input).toBeDisabled();
    });

    it('calls onLimitExceeded when character limit is exceeded', () => {
        const Wrapper = () => {
            const [value, setValue] = useState('');
            return (
                <TextInput
                    label="Name"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    maxLength={5}
                    onLimitExceeded={handleLimitExceeded}
                />
            );
        };

        render(<Wrapper />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '123456' } });
        expect(handleLimitExceeded).toHaveBeenCalledWith(true);
    });

    it('displays character limit warning when exceeded', () => {
        render(
            <TextInput
                label="Name"
                value="123456"
                onChange={() => {}}
                maxLength={5}
            />
        );
        expect(screen.getByText(/character_limit/i)).toBeInTheDocument();
    });

    it('renders correct placeholder based on required prop', () => {
        render(<TextInput label="Name" value="" onChange={() => {}} required />);
        const input = screen.getByPlaceholderText('general.required');
        expect(input).toBeInTheDocument();
    });
});