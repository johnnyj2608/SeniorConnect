import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberAbsenceCard from './MemberAbsenceCard';
import { openFile } from '../../utils/fileUtils';
import { formatDate, formatTime, formatStatus } from '../../utils/formatUtils';

jest.mock('../../utils/fileUtils', () => ({
    openFile: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key.split('.').pop() }),
}));

jest.mock('../layout/CardMember', () => ({ children, onEdit, emptyMessage }) => (
    <div>
        <button onClick={onEdit}>Edit</button>
        {children}
        {emptyMessage && <div>{emptyMessage}</div>}
    </div>
));

jest.mock('../layout/MemberDetail', () => ({ label, value }) => (
    <div>{label}: {value}</div>
));

describe('MemberAbsenceCard', () => {
    const absenceData = [
        {
            absence_type: 'assessment',
            start_date: '2025-09-22',
            time: '11:00:00',
            user_name: 'Dr. Smith',
            note: 'Assessment note',
        },
        {
            absence_type: 'vacation',
            start_date: '2025-09-23',
            end_date: '2025-09-28',
            note: 'Vacation note',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders absences correctly', () => {
        render(<MemberAbsenceCard data={absenceData} />);

        // Assessment absence
        const assessment = absenceData[0];
        expect(screen.getByText(`label: ${assessment.absence_type}`)).toBeInTheDocument();
        expect(screen.getByText(`date: ${formatDate(assessment.start_date)}`)).toBeInTheDocument();
        expect(screen.getByText(`time: ${formatTime(assessment.time)}`)).toBeInTheDocument();
        expect(screen.getByText(`user: ${assessment.user_name}`)).toBeInTheDocument();
        expect(screen.getByText(`note: ${assessment.note}`)).toBeInTheDocument();

        // Vacation absence
        const vacation = absenceData[1];
        expect(screen.getByText(`label: ${vacation.absence_type}`)).toBeInTheDocument();
        expect(screen.getByText(`start_date: ${formatDate(vacation.start_date)}`)).toBeInTheDocument();
        expect(screen.getByText(`end_date: ${formatDate(vacation.end_date)}`)).toBeInTheDocument();
        expect(
            screen.getByText(`status: ${formatStatus(vacation.start_date, vacation.end_date)}`)
        ).toBeInTheDocument();
        expect(screen.getByText(`note: ${vacation.note}`)).toBeInTheDocument();
    });

    it('renders empty state when no absences', () => {
        render(<MemberAbsenceCard data={[]} />);
        expect(screen.getByText('no_absences')).toBeInTheDocument();
    });

    it('renders file button and calls openFile on click', () => {
        const absenceWithFile = {
            absence_type: 'vacation',
            start_date: '2025-09-23',
            end_date: '2025-09-28',
            note: 'Vacation note',
            file: { url: 'file-url' },
        };
        render(<MemberAbsenceCard data={[absenceWithFile]} />);

        const button = screen.getByText('view_file');
        fireEvent.click(button);
        expect(openFile).toHaveBeenCalledWith(absenceWithFile.file);
    });

    it('filters out past absences', () => {
        const pastAbsence = {
            absence_type: 'vacation',
            start_date: '2025-01-01',
            end_date: '2025-01-05',
            note: 'Past absence',
        };
        const futureAbsence = {
            absence_type: 'vacation',
            start_date: '2025-12-01',
            end_date: '2025-12-05',
            note: 'Future absence',
        };

        render(<MemberAbsenceCard data={[pastAbsence, futureAbsence]} />);

        expect(screen.queryByText('note: Past absence')).not.toBeInTheDocument();
        expect(screen.getByText('note: Future absence')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
        const mockOnEdit = jest.fn();
        render(<MemberAbsenceCard data={absenceData} onEdit={mockOnEdit} />);
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(mockOnEdit).toHaveBeenCalled();
    });
});