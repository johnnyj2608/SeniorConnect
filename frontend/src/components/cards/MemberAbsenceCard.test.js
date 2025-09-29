import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MemberAbsenceCard from './MemberAbsenceCard';
import { openFile } from '../../utils/fileUtils';

jest.mock('../../utils/fileUtils', () => ({
    openFile: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key }),
}));

jest.mock('../layout/CardMember', () => ({ children, onEdit, emptyMessage }) => (
    <div>
        <button data-testid="edit-button" onClick={() => onEdit && onEdit('absences', { fetchData: jest.fn() })}>Edit</button>
        {children}
        {emptyMessage && <div>{emptyMessage}</div>}
    </div>
));

jest.mock('../layout/MemberDetail', () => ({ label, value }) => (
    <div data-testid="member-detail">{label}: {value}</div>
));

describe('MemberAbsenceCard', () => {
    const mockOnEdit = jest.fn();
    const absencesData = [
        {
            absence_type: 'vacation',
            start_date: '2025-09-01',
            end_date: '2025-09-10',
            note: 'Family trip',
            file: 'file1.pdf',
            user_name: 'John Doe'
        },
        {
            absence_type: 'assessment',
            start_date: '2025-09-15',
            time: '14:00',
            note: 'Initial assessment',
            user_name: 'Jane Smith'
        },
        {
            absence_type: 'sick',
            start_date: '2025-08-01',
            end_date: '2025-08-05',
            note: 'Flu'
        }
    ];

    // ✅ Mock Date to a value that ensures vacation is active
    const RealDate = Date;
    beforeAll(() => {
        global.Date = class extends RealDate {
            constructor(...args) {
                if (args.length) return new RealDate(...args);
                // "today" is inside vacation range
                return new RealDate('2025-09-05T00:00:00Z');
            }
        };
    });

    afterAll(() => {
        global.Date = RealDate;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders active absences correctly', () => {
        render(<MemberAbsenceCard data={absencesData} onEdit={mockOnEdit} />);

        const details = screen.getAllByTestId('member-detail');
        expect(details.some(d => d.textContent.includes('member.absences.label'))).toBe(true);
        expect(details.some(d => d.textContent.includes('general.note'))).toBe(true);
        expect(details.some(d => d.textContent.includes('member.absences.date'))).toBe(true);
        expect(details.some(d => d.textContent.includes('member.absences.time'))).toBe(true);
        expect(details.some(d => d.textContent.includes('member.absences.user'))).toBe(true);
    });

    it('calls openFile when file button is clicked', () => {
        render(<MemberAbsenceCard data={absencesData} onEdit={mockOnEdit} />);

        const fileBtn = screen.getByText('general.buttons.view_file');
        fireEvent.click(fileBtn);

        expect(openFile).toHaveBeenCalledWith('file1.pdf');
    });

    it('calls onEdit when edit button is clicked', () => {
        render(<MemberAbsenceCard data={absencesData} onEdit={mockOnEdit} />);
        const editButton = screen.getByTestId('edit-button');
        fireEvent.click(editButton);

        expect(mockOnEdit).toHaveBeenCalled();
        const args = mockOnEdit.mock.calls[0];
        expect(args[0]).toBe('absences');
        expect(typeof args[1].fetchData).toBe('function');
    });

    it('renders empty message when no data', () => {
        render(<MemberAbsenceCard data={[]} onEdit={mockOnEdit} />);
        expect(screen.getByText('member.absences.no_absences')).toBeInTheDocument();
    });
});