import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsMltcModal from './SettingsMltcModal';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../inputs/TextInput', () => ({ label, value }) => (
    <label>
        {label}
        <input value={value} />
    </label>
));

jest.mock('../inputs/ListInput', () => ({ data }) => (
    <div>ListInput: {data.join(', ')}</div>
));

jest.mock('../layout/ListDetail', () => ({ label, value }) => (
    <div>
        <span>{label}</span> - {value}
    </div>
));

const noop = () => {};

describe('SettingsMltcModal', () => {
    const sampleData = [
        { id: 1, name: 'MLTC 1', active: true, deleted: false, dx_codes: ['A01', 'B02'] },
    ];

    it('renders TextInput and ListDetail correctly', () => {
        render(
            <SettingsMltcModal
                data={sampleData}
                handleChange={noop}
                handleLimit={noop}
                activeTab={0}
            />
        );

        const nameInput = screen.getByLabelText('settings.admin.mltcs.name');
        expect(nameInput).toBeInTheDocument();
        expect(nameInput.value).toBe('MLTC 1');

        expect(screen.getByText('settings.admin.mltcs.dx_codes')).toBeInTheDocument();
        expect(screen.getByText(/ListInput: A01, B02/)).toBeInTheDocument();

        const checkboxes = screen.getAllByRole('checkbox', { name: /status.active/i });
        expect(checkboxes[0]).toBeInTheDocument();
        expect(checkboxes[0].checked).toBe(true);
    });

    it('calls handleChange when checkbox is clicked', () => {
        const handleChangeMock = jest.fn(() => noop);

        render(
            <SettingsMltcModal
                data={sampleData}
                handleChange={handleChangeMock}
                handleLimit={noop}
                activeTab={0}
            />
        );

        const checkbox = screen.getAllByRole('checkbox', { name: /status.active/i })[0];
        fireEvent.click(checkbox);

        expect(handleChangeMock).toHaveBeenCalledWith('active');
    });

    it('checkbox is disabled when all tabs are deleted', () => {
        const deletedData = [
            { id: 1, name: 'MLTC 1', active: true, deleted: true, dx_codes: ['A01', 'B02'] },
        ];

        render(
            <SettingsMltcModal
                data={deletedData}
                handleChange={noop}
                handleLimit={noop}
                activeTab={0}
            />
        );

        const checkbox = screen.getAllByRole('checkbox', { name: /status.active/i })[0];
        expect(checkbox.disabled).toBe(true);
    });
});
