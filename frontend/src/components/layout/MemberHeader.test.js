import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MemberHeader from './MemberHeader';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../buttons/AttendanceButton', () => ({ onClick }) => (
    <button onClick={onClick}>Attendance</button>
));

jest.mock('../inputs/MltcFilter', () => ({ value, onChange }) => (
    <input placeholder="MLTC Filter" value={value} onChange={(e) => onChange(e.target.value)} />
));

jest.mock('../inputs/SearchMembers', () => ({ value, onChange, onSelect }) => (
    <input
        placeholder="Search Members"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={() => onSelect({ id: 1 })}
    />
));

describe('MemberHeader', () => {
    it('renders the page title', () => {
        render(<MemberHeader navigate={jest.fn()} handleOpenAttendance={jest.fn()} />);
        const title = screen.getByRole('heading', { level: 2 });
        expect(title.textContent).toContain('general.members');
    });

    it('calls handleOpenAttendance when Attendance button is clicked', () => {
        const mockAttendance = jest.fn();
        render(<MemberHeader navigate={jest.fn()} handleOpenAttendance={mockAttendance} />);
        fireEvent.click(screen.getByText('Attendance'));
        expect(mockAttendance).toHaveBeenCalled();
    });

    it('navigates to member page when SearchMembers selection occurs', () => {
        const mockNavigate = jest.fn();
        render(<MemberHeader navigate={mockNavigate} handleOpenAttendance={jest.fn()} />);
        const searchInput = screen.getByPlaceholderText('Search Members');
        fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
        expect(mockNavigate).toHaveBeenCalledWith('/members/1');
    });

    it('clears filters when clear_filters is clicked', () => {
        render(<MemberHeader navigate={jest.fn()} handleOpenAttendance={jest.fn()} />);
        const mltcInput = screen.getByPlaceholderText('MLTC Filter');
        const searchInput = screen.getByPlaceholderText('Search Members');

        fireEvent.change(mltcInput, { target: { value: 'test' } });
        fireEvent.change(searchInput, { target: { value: 'query' } });

        fireEvent.click(screen.getByText('general.buttons.clear_filters'));

        expect(mltcInput.value).toBe('');
        expect(searchInput.value).toBe('');
    });
});