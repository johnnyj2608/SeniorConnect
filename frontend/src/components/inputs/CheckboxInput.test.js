import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckboxInput from './CheckboxInput';

describe('CheckboxInput', () => {
    const options = [
        { id: '1', name: 'option_one' },
        { id: '2', name: 'option_two' },
        { id: '3', name: 'option_three' },
    ];

    it('renders all options correctly', () => {
        render(<CheckboxInput options={options} selectedValues={[]} />);

        options.forEach(option => {
            const checkbox = screen.getByLabelText(option.name);
            expect(checkbox).toBeInTheDocument();
            expect(checkbox).not.toBeChecked();
        });
    });

    it('renders selected values as checked', () => {
        render(<CheckboxInput options={options} selectedValues={['1', '3']} />);

        expect(screen.getByLabelText('option_one')).toBeChecked();
        expect(screen.getByLabelText('option_two')).not.toBeChecked();
        expect(screen.getByLabelText('option_three')).toBeChecked();
    });

    it('calls onChange correctly when a checkbox is toggled', () => {
        const Wrapper = () => {
            const [selected, setSelected] = React.useState(['1']);
            return <CheckboxInput options={options} selectedValues={selected} onChange={setSelected} />;
        };

        render(<Wrapper />);

        const checkbox2 = screen.getByLabelText('option_two');
        fireEvent.click(checkbox2);
        expect(screen.getByLabelText('option_two')).toBeChecked();

        const checkbox1 = screen.getByLabelText('option_one');
        fireEvent.click(checkbox1);
        expect(checkbox1).not.toBeChecked();
    });

    it('disables checkboxes when disabled prop is true', () => {
        render(<CheckboxInput options={options} selectedValues={['1']} disabled={true} />);

        options.forEach(option => {
            const checkbox = screen.getByLabelText(option.name);
            expect(checkbox).toBeDisabled();
            expect(checkbox).not.toBeChecked();
        });
    });

    it('disables checkboxes when isAdmin is true', () => {
        render(<CheckboxInput options={options} selectedValues={['1']} isAdmin={true} />);

        options.forEach(option => {
            const checkbox = screen.getByLabelText(option.name);
            expect(checkbox).toBeDisabled();
            if (option.id === '1') {
                expect(checkbox).toBeChecked();
            } else {
                expect(checkbox).not.toBeChecked();
            }
        });
    });
});