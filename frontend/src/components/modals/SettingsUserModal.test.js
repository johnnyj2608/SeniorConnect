import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsUserModal from './SettingsUserModal';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../inputs/TextInput', () => (props) => (
    <label>
        {props.label}
        <input {...props} />
    </label>
));

jest.mock('../inputs/CheckboxInput', () => (props) => (
    <div>
        {(props.options || []).map((opt) => (
            <label key={opt.name}>
                <input
                    type="checkbox"
                    checked={(props.selectedValues || []).includes(opt.name)}
                    onChange={() =>
                        props.onChange([...(props.selectedValues || []), opt.name])
                    }
                />
                {opt.name}
            </label>
        ))}
    </div>
));

jest.mock('../layout/ListDetail', () => (props) => (
    <div>
        {props.label} - {props.value}
    </div>
));

const noop = () => {};

const mockData = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        is_active: true,
        view_snapshots: true,
        is_org_admin: false,
        allowed_mltcs: ['MLTC1'],
    },
];

const mockMltcs = [{ name: 'MLTC1' }, { name: 'MLTC2' }];

describe('SettingsUserModal - core behaviors', () => {
    beforeEach(() => {
        global.alert = jest.fn();
        global.fetch = jest.fn(() =>
            Promise.resolve({ json: () => Promise.resolve({}) })
        );

        render(
            <SettingsUserModal
                data={mockData}
                handleChange={noop}
                handleLimit={noop}
                activeTab={0}
                mltcs={mockMltcs}
            />
        );
    });

    it('renders name and email inputs', () => {
        expect(screen.getByLabelText('settings.admin.users.name')).toBeInTheDocument();
        expect(screen.getByLabelText('settings.admin.users.email')).toBeInTheDocument();
    });

    it('renders active checkbox for non-admin users', () => {
        const checkbox = screen.getByRole('checkbox', { name: /status.active/i });
        expect(checkbox).toBeInTheDocument();
        expect(checkbox.checked).toBe(true);
    });

    it('renders view snapshots checkbox', () => {
        const checkbox = screen.getByRole('checkbox', { name: /settings.admin.users.can_view_snapshots/i });
        expect(checkbox).toBeInTheDocument();
        expect(checkbox.checked).toBe(true);
    });

    it('renders MLTC checkboxes', () => {
        mockMltcs.forEach((mltc) => {
            expect(screen.getByLabelText(mltc.name)).toBeInTheDocument();
        });
    });

    it('calls alert and fetch when reset password is clicked', async () => {
        const resetButton = screen.getByText('settings.admin.users.password_reset');
        fireEvent.click(resetButton);

        expect(global.alert).toHaveBeenCalledWith('settings.account.password_reset_instructions');
        expect(global.fetch).toHaveBeenCalledWith('/user/auth/reset-password/', expect.any(Object));
    });
});