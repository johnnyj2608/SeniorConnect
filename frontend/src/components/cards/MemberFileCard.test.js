import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MemberFileCard from './MemberFileCard';
import { openFile } from '../../utils/fileUtils';

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

describe('MemberFileCard', () => {
    const mockOnEdit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const filesData = [
        { id: 1, name: 'File 1', file: { url: 'file1.pdf' } },
        { id: 2, name: 'File 2', file: { url: 'file2.pdf' } },
    ];

    it('renders files correctly', () => {
        render(<MemberFileCard data={filesData} onEdit={mockOnEdit} />);
        filesData.forEach(file => {
            expect(screen.getByText(file.name)).toBeInTheDocument();
        });
    });

    it('calls openFile when a file item is clicked', () => {
        render(<MemberFileCard data={filesData} onEdit={mockOnEdit} />);
        fireEvent.click(screen.getByText('File 1'));
        expect(openFile).toHaveBeenCalledWith(filesData[0].file);
    });

    it('renders empty state when no files', () => {
        render(<MemberFileCard data={[]} onEdit={mockOnEdit} />);
        expect(screen.getByText('no_files')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
        render(<MemberFileCard data={filesData} onEdit={mockOnEdit} />);
        fireEvent.click(screen.getByText('Edit'));
        expect(mockOnEdit).toHaveBeenCalled();
    });
});