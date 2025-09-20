import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MltcFilter from './MltcFilter';
import { MltcContext } from '../../context/MltcContext';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key }),
}));

describe('MltcFilter', () => {
    const refreshMltc = jest.fn();
    const onChange = jest.fn();
    const mltcs = [
        { name: 'MLTC1' },
        { name: 'MLTC2' },
    ];

    const renderComponent = (value = '') => {
        return render(
            <MltcContext.Provider value={{ mltcs, refreshMltc }}>
                <MltcFilter value={value} onChange={onChange} />
            </MltcContext.Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls refreshMltc on mount', () => {
        renderComponent();
        expect(refreshMltc).toHaveBeenCalled();
    });

    it('renders all options correctly', () => {
        renderComponent();

        // Default "all" option
        expect(screen.getByText('members.all_mltcs')).toBeInTheDocument();

        // MLTC options
        mltcs.forEach((option) => {
            expect(screen.getByText(option.name)).toBeInTheDocument();
        });

        // Unknown and inactive options
        expect(screen.getByText('members.no_mltc')).toBeInTheDocument();
        expect(screen.getByText('members.inactive')).toBeInTheDocument();
    });

    it('sets the selected value correctly', () => {
        renderComponent('MLTC2');
        const select = screen.getByRole('combobox');
        expect(select.value).toBe('MLTC2');
    });

    it('calls onChange when a new option is selected', () => {
        renderComponent();

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'MLTC1' } });

        expect(onChange).toHaveBeenCalledWith('MLTC1');
    });

    it('selects "unknown" and "inactive" options correctly', () => {
        renderComponent();

        const select = screen.getByRole('combobox');

        fireEvent.change(select, { target: { value: 'unknown' } });
        expect(onChange).toHaveBeenCalledWith('unknown');

        fireEvent.change(select, { target: { value: 'inactive' } });
        expect(onChange).toHaveBeenCalledWith('inactive');
    });
});