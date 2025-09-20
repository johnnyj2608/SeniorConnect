import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MembersAttendanceModal from './MembersAttendanceModal';

jest.mock('../../utils/mergeSortedArrays', () => (arrays, keyFn) =>
    arrays.flat().sort((a, b) => keyFn(a) - keyFn(b))
);

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('MembersAttendanceModal - core behaviors', () => {
    const noop = () => {};
    const mockAddQueue = jest.fn();
    const mockAddMltcQueue = jest.fn();
    const mockOnMonthChange = jest.fn();

    const membersData = {
        MLTC1: [
            { id: 1, sadc_member_id: '1001', first_name: 'John', last_name: 'Doe', alt_name: '', mltc_name: 'MLTC1' },
            { id: 2, sadc_member_id: '1002', first_name: 'Jane', last_name: 'Smith', alt_name: '', mltc_name: 'MLTC1' },
        ],
        MLTC2: [
            { id: 3, sadc_member_id: '1003', first_name: 'Alice', last_name: 'Johnson', alt_name: '', mltc_name: 'MLTC2' },
        ],
    };

    it('renders header and month input', () => {
        render(
            <MembersAttendanceModal
                members={membersData}
                onMonthChange={mockOnMonthChange}
                addQueue={mockAddQueue}
                addMltcQueue={mockAddMltcQueue}
            />
        );

        expect(screen.getByText('general.buttons.attendance_sheets')).toBeInTheDocument();
        expect(screen.getByDisplayValue(new Date().toISOString().slice(0, 7))).toBeInTheDocument();
    });

    it('renders MLTC and member lists', () => {
        render(
            <MembersAttendanceModal
                members={membersData}
                onMonthChange={noop}
                addQueue={noop}
                addMltcQueue={noop}
            />
        );

        // MLTC list
        expect(screen.getByText('MLTC1')).toBeInTheDocument();
        expect(screen.getByText('MLTC2')).toBeInTheDocument();
        expect(screen.getByText('members.all_mltcs')).toBeInTheDocument();

        // Member list
        expect(screen.getByText('Doe, John')).toBeInTheDocument();
        expect(screen.getByText('Smith, Jane')).toBeInTheDocument();
        expect(screen.getByText('Johnson, Alice')).toBeInTheDocument();
    });

    it('selects MLTC and member', () => {
        render(
            <MembersAttendanceModal
                members={membersData}
                onMonthChange={noop}
                addQueue={noop}
                addMltcQueue={noop}
            />
        );

        fireEvent.click(screen.getByText('MLTC1'));
        fireEvent.click(screen.getByText('Doe, John'));

        expect(screen.getByText('general.buttons.add_member')).toBeInTheDocument();
    });

    it('calls addQueue for selected member', () => {
        render(
            <MembersAttendanceModal
                members={membersData}
                onMonthChange={noop}
                addQueue={mockAddQueue}
                addMltcQueue={mockAddMltcQueue}
            />
        );

        fireEvent.click(screen.getByText('MLTC1'));
        fireEvent.click(screen.getByText('Doe, John'));
        fireEvent.click(screen.getByText('general.buttons.add_member'));

        expect(mockAddQueue).toHaveBeenCalledWith(membersData.MLTC1[0], 'MLTC1');
    });

    it('calls addMltcQueue for selected MLTC', () => {
        render(
            <MembersAttendanceModal
                members={membersData}
                onMonthChange={noop}
                addQueue={mockAddQueue}
                addMltcQueue={mockAddMltcQueue}
            />
        );

        fireEvent.click(screen.getByText('MLTC2'));
        fireEvent.click(screen.getByText('general.buttons.add_mltc'));

        expect(mockAddMltcQueue).toHaveBeenCalledWith('MLTC2');
    });

    it('calls addMltcQueue for all MLTCs', () => {
        render(
            <MembersAttendanceModal
                members={membersData}
                onMonthChange={noop}
                addQueue={mockAddQueue}
                addMltcQueue={mockAddMltcQueue}
            />
        );

        fireEvent.click(screen.getByText('members.all_mltcs'));
        fireEvent.click(screen.getByText('general.buttons.add_all'));

        expect(mockAddMltcQueue).toHaveBeenCalledWith('MLTC1');
        expect(mockAddMltcQueue).toHaveBeenCalledWith('MLTC2');
    });
});