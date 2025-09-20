import React from 'react';
import { render, screen } from '@testing-library/react';
import SettingsSadcModal from './SettingsSadcModal';
import { AuthContext } from '../../context/AuthContext';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../inputs/TextInput', () => (props) => (
    <label>
        {props.label}
        <input {...props} />
    </label>
));

jest.mock('../inputs/ListInput', () => ({ data }) => (
    <div>ListInput: {data.join(', ')}</div>
));

jest.mock('../layout/ListDetail', () => ({ label, value }) => (
    <div>
        {label} - {value}
    </div>
));

jest.mock('../../utils/generateAttendance', () => jest.fn());

const noop = () => {};

const mockData = {
    name: 'SADC Name',
    email: 'sadc@example.com',
    phone: '1234567890',
    address: '123 Street',
    npi: '9876543210',
    attendance_template: 1,
    languages: ['English', 'Spanish'],
};

describe('SettingsSadcModal', () => {
    beforeEach(() => {
        render(
            <AuthContext.Provider value={{ user: { is_org_admin: true } }}>
                <SettingsSadcModal
                    data={mockData}
                    handleChange={noop}
                    handleLimit={noop}
                />
            </AuthContext.Provider>
        );
    });

    it('renders all TextInputs with correct values', () => {
        expect(screen.getByLabelText('settings.admin.sadc.name').value).toBe(mockData.name);
        expect(screen.getByLabelText('settings.admin.sadc.email').value).toBe(mockData.email);
        expect(screen.getByLabelText('settings.admin.sadc.phone').value).toBe(mockData.phone);
        expect(screen.getByLabelText('settings.admin.sadc.address').value).toBe(mockData.address);
        expect(screen.getByLabelText('settings.admin.sadc.npi').value).toBe(mockData.npi);
    });

    it('renders attendance select with correct value', () => {
        const select = screen.getByRole('combobox');
        expect(select.value).toBe(String(mockData.attendance_template));
    });

    it('renders languages ListInput', () => {
        expect(screen.getByText('ListInput: English, Spanish')).toBeInTheDocument();
    });

    it('renders the generateAttendance button', () => {
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    it('attendance select is enabled for admin users', () => {
        const select = screen.getByRole('combobox');
        expect(select.disabled).toBe(false);
    });
});