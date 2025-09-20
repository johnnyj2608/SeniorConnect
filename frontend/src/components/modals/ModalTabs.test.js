import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalTabs from './ModalTabs';
import { formatStatus } from '../../utils/formatUtils';

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('ModalTabs', () => {
    const handleTabClick = jest.fn();

    it('renders add tab button', () => {
        const tab = { add: true };
        render(
            <ModalTabs
                index={0}
                activeTab={0}
                handleTabClick={handleTabClick}
                type="files"
                tab={tab}
            />
        );
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies correct classes for active, edited, and expired tabs', () => {
        const tab = { name: 'File 2', edited: true, active: false };
        render(
            <ModalTabs
                index={0}
                activeTab={0}
                handleTabClick={handleTabClick}
                type="mltcs"
                tab={tab}
            />
        );
        const tabButton = screen.getByRole('button');
        expect(tabButton).toHaveClass('tab-button active edited expired');
    });

    it('does not render deleted tabs', () => {
        const tab = { deleted: true };
        const { container } = render(
            <ModalTabs
                index={0}
                activeTab={0}
                handleTabClick={handleTabClick}
                type="files"
                tab={tab}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders absences with formatted status', () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1); // yesterday
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 1); // tomorrow

        const tab = {
            absence_type: 'vacation',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
        };

        render(
            <ModalTabs
                index={0}
                activeTab={0}
                handleTabClick={handleTabClick}
                type="absences"
                tab={tab}
            />
        );

        expect(screen.getByText('member.absences.vacation')).toBeInTheDocument();
        const status = formatStatus(tab.start_date, tab.end_date); // should be 'ongoing'
        expect(screen.getByText(`member.absences.${status}`)).toBeInTheDocument();
    });

    it('renders files with heading and formatted date', () => {
        const tab = { name: 'Insurance.pdf', date: '2025-01-01' };
        render(
            <ModalTabs
                index={0}
                activeTab={0}
                handleTabClick={handleTabClick}
                type="files"
                tab={tab}
            />
        );
        expect(screen.getByText('Insurance.pdf')).toBeInTheDocument();
        expect(screen.getByText('01/01/2025')).toBeInTheDocument();
    });

    it('calls handleTabClick with index when tab is clicked', () => {
        const tab = { name: 'Test Tab', active: true };
        render(
            <ModalTabs
                index={3}
                activeTab={0}
                handleTabClick={handleTabClick}
                type="files"
                tab={tab}
            />
        );
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(handleTabClick).toHaveBeenCalledWith(3);
    });
});