import React from 'react';
import { render, screen } from '@testing-library/react';
import MemberAuthModal from './MemberAuthModal';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../inputs/TextInput', () => (props) => (
    <label>
        {props.label}
        <input {...props} />
    </label>
));

jest.mock('../inputs/FileUpload', () => (props) => (
    <label>
        {props.label || 'file-upload'}
        <input type="file" {...props} />
    </label>
));

jest.mock('../layout/ListDetail', () => (props) => (
    <div>{props.value || Object.values(props.tabContent)}</div>
));

jest.mock('../inputs/CheckboxInput', () => (props) => (
    <div>
        {(props.options || []).map((opt) => (
            <label key={opt.id}>
                <input
                    type="checkbox"
                    checked={(props.selectedValues || []).includes(opt.id)}
                    onChange={() =>
                        props.onChange([...(props.selectedValues || []), opt.id])
                    }
                />
                {props.translateFn ? props.translateFn(opt.id) : opt.name}
            </label>
        ))}
    </div>
));

const mockData = [
    {
        id: '1',
        active: true,
        mltc: 'MLTC1',
        mltc_member_id: '123',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        dx_code: 'A00',
        schedule: ['monday', 'tuesday'],
        services: [{ auth_id: '001', service_code: 'SC01', service_units: 5 }],
        cm_name: 'John Doe',
        cm_phone: '1234567890',
        file: null,
    },
];

const noop = () => {};

describe('MemberAuthModal - core behaviors', () => {
    beforeEach(() => {
        render(
            <MemberAuthModal
                data={mockData}
                handleChange={noop}
                activeTab={0}
                mltcs={[{ name: 'MLTC1', dx_codes: ['A00', 'B00'] }]}
                handleActiveToggle={noop}
                handleAdd={noop}
                dragStatus={noop}
                handleLimit={noop}
            />
        );
    });

    it('renders start and end date inputs', () => {
        expect(screen.getByLabelText('member.authorizations.start_date')).toBeInTheDocument();
        expect(screen.getByLabelText('member.authorizations.end_date')).toBeInTheDocument();
    });

    it('renders care manager name and phone inputs', () => {
        expect(screen.getByLabelText('member.authorizations.care_manager')).toBeInTheDocument();
        expect(screen.getByLabelText('↪ member.authorizations.phone')).toBeInTheDocument();
    });

    it('renders DX code select', () => {
        expect(screen.getByLabelText('member.authorizations.dx_code')).toBeInTheDocument();
    });

    it('renders schedule checkboxes', () => {
        ['general.days_of_week.monday', 'general.days_of_week.tuesday'].forEach((day) => {
            const checkbox = screen.getByLabelText(day);
            expect(checkbox).toBeInTheDocument();
            expect(checkbox.checked).toBe(mockData[0].schedule.includes(day.split('.').pop()));
        });
    });

    it('renders file upload', () => {
        expect(screen.getByLabelText('file-upload')).toBeInTheDocument();
    });
});
