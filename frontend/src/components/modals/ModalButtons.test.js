import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CancelButton, DeleteButton, SaveButton } from './ModalButtons';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../assets/info.svg', () => ({
    ReactComponent: () => <svg data-testid="info-icon" />,
}));

describe('ActionButtons - core behaviors', () => {
    const noop = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('CancelButton', () => {
        it('renders and calls onClose when clicked', () => {
            render(<CancelButton onClose={noop} />);
            const btn = screen.getByText('general.buttons.cancel');
            expect(btn).toBeInTheDocument();

            fireEvent.click(btn);
            expect(noop).toHaveBeenCalled();
        });
    });

    describe('DeleteButton', () => {
        it('renders nothing if showDeleteButton is false', () => {
            const { container } = render(<DeleteButton showDeleteButton={false} />);
            expect(container.firstChild).toBeNull();
        });

        it('renders InfoIcon for gifteds type', () => {
            render(<DeleteButton showDeleteButton={true} type="gifteds" />);
            expect(screen.getByTestId('info-icon')).toBeInTheDocument();
        });

        it('renders destructive delete button for normal type', () => {
            const mockDelete = jest.fn();
            render(<DeleteButton showDeleteButton={true} type="normal" onDelete={mockDelete} />);
            const btn = screen.getByText('general.buttons.delete');
            expect(btn).toBeInTheDocument();

            fireEvent.click(btn);
            expect(mockDelete).toHaveBeenCalled();
        });

        it('renders restore button for deleted type', () => {
            const mockDelete = jest.fn();
            render(<DeleteButton showDeleteButton={true} type="deleted" onDelete={mockDelete} />);
            const btn = screen.getByText('general.buttons.restore');
            expect(btn).toBeInTheDocument();

            fireEvent.click(btn);
            expect(mockDelete).toHaveBeenCalled();
        });

        it('calls onClearQueue for attendance type', () => {
            const mockClear = jest.fn();
            render(<DeleteButton showDeleteButton={true} type="attendance" onClearQueue={mockClear} />);
            const btn = screen.getByText('general.buttons.clear');
            fireEvent.click(btn);
            expect(mockClear).toHaveBeenCalled();
        });
    });

    describe('SaveButton', () => {
        it('renders save button for normal type', () => {
            const mockSave = jest.fn();
            render(<SaveButton type="normal" onSave={mockSave} />);
            const btn = screen.getByText('general.buttons.save');
            expect(btn).toBeInTheDocument();

            fireEvent.click(btn);
            expect(mockSave).toHaveBeenCalled();
        });

        it('renders generate button for attendance type', () => {
            const mockGenerate = jest.fn();
            render(<SaveButton type="attendance" hasQueuedMembers={true} onGenerate={mockGenerate} />);
            const btn = screen.getByText('general.buttons.generate');
            fireEvent.click(btn);
            expect(mockGenerate).toHaveBeenCalled();
        });

        it('disables button if isSaving', () => {
            const mockSave = jest.fn();
            render(<SaveButton type="normal" isSaving={true} onSave={mockSave} />);
            const btn = screen.getByText('general.buttons.saving');
            expect(btn).toBeDisabled();
        });

        it('disables attendance button if no queued members', () => {
            const mockGenerate = jest.fn();
            render(<SaveButton type="attendance" hasQueuedMembers={false} onGenerate={mockGenerate} />);
            const btn = screen.getByText('general.buttons.generate');
            expect(btn).toBeDisabled();
        });

        it('disables button if inputLimitExceeded', () => {
            const mockSave = jest.fn();
            render(<SaveButton type="normal" inputLimitExceeded={true} onSave={mockSave} />);
            const btn = screen.getByText('general.buttons.save');
            expect(btn).toBeDisabled();
        });
    });
});