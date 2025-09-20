import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalQueue from './ModalQueue';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

describe('ModalQueue - core behaviors', () => {
    const noop = jest.fn();
    const mockRemoveQueue = jest.fn();
    const mockClearMltcQueue = jest.fn();

    const membersData = {
        MLTC1: [
            { id: 1, sadc_member_id: '1001', first_name: 'John', last_name: 'Doe', alt_name: '' },
            { id: 2, sadc_member_id: '1002', first_name: 'Jane', last_name: 'Smith', alt_name: '' },
        ],
        MLTC2: [
            { id: 3, sadc_member_id: '1003', first_name: 'Alice', last_name: 'Johnson', alt_name: '' },
        ],
        MLTC3: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders placeholder if no members', () => {
        render(<ModalQueue members={{}} removeQueue={noop} clearMltcQueue={noop} />);
        expect(screen.getByText('members.no_members')).toBeInTheDocument();
    });

    it('renders MLTC tabs with member counts', () => {
        render(
            <ModalQueue
                members={membersData}
                removeQueue={noop}
                clearMltcQueue={noop}
            />
        );

        expect(screen.getByText('MLTC1')).toBeInTheDocument();
        expect(screen.getByText('general.members: 2')).toBeInTheDocument();
        expect(screen.getByText('MLTC2')).toBeInTheDocument();
        expect(screen.getByText('general.members: 1')).toBeInTheDocument();
        // MLTC3 has no members, should not render
        expect(screen.queryByText('MLTC3')).toBeNull();
    });

    it('toggles MLTC tab open/closed on click', () => {
        render(
            <ModalQueue
                members={membersData}
                removeQueue={noop}
                clearMltcQueue={noop}
            />
        );

        const mlct1Button = screen.getByText('MLTC1');
        // By default, tabs with <5 members should open automatically
        expect(screen.getByText('Doe, John')).toBeInTheDocument();
        fireEvent.click(mlct1Button);
        // Clicking closes the tab
        expect(screen.queryByText('Doe, John')).toBeNull();
        fireEvent.click(mlct1Button);
        // Clicking again reopens
        expect(screen.getByText('Doe, John')).toBeInTheDocument();
    });

    it('calls removeQueue when member is clicked', () => {
        render(
            <ModalQueue
                members={membersData}
                removeQueue={mockRemoveQueue}
                clearMltcQueue={mockClearMltcQueue}
            />
        );

        fireEvent.click(screen.getByText('Doe, John'));
        expect(mockRemoveQueue).toHaveBeenCalledWith(1, 'MLTC1');
    });

    it('calls clearMltcQueue when clear button is clicked', () => {
        render(
            <ModalQueue
                members={membersData}
                removeQueue={mockRemoveQueue}
                clearMltcQueue={mockClearMltcQueue}
            />
        );

        const clearButtons = screen.getAllByText('general.buttons.clear_mltc');

        fireEvent.click(clearButtons[0]);
        expect(mockClearMltcQueue).toHaveBeenCalledWith('MLTC1');

        fireEvent.click(clearButtons[1]);
        expect(mockClearMltcQueue).toHaveBeenCalledWith('MLTC2');
    });
});