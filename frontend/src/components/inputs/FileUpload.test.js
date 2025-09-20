import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FileUpload from './FileUpload';
import { openFile } from '../../utils/fileUtils';

jest.mock('../../utils/fileUtils', () => ({
    openFile: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key }),
}));

describe('FileUpload', () => {
    let handleChange;

    beforeEach(() => {
        jest.clearAllMocks();
        handleChange = jest.fn((field) => jest.fn());
    });

    it('renders upload button and subtitle correctly', () => {
        render(<FileUpload file={null} handleChange={handleChange} />);
        expect(screen.getByRole('button', { name: 'general.buttons.upload' })).toBeInTheDocument();
        expect(screen.getByText('member.files.drop_to_upload')).toBeInTheDocument();
    });

    it('renders view button for viewable file types', () => {
        render(<FileUpload file="test.pdf" handleChange={handleChange} />);
        expect(screen.getByRole('button', { name: 'general.buttons.view' })).toBeInTheDocument();
    });

    it('does not render view button for non-viewable file types', () => {
        render(<FileUpload file="file.exe" handleChange={handleChange} />);
        expect(screen.queryByRole('button', { name: 'general.buttons.view' })).not.toBeInTheDocument();
    });

    it('calls openFile when view button is clicked', () => {
        render(<FileUpload file="document.pdf" handleChange={handleChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'general.buttons.view' }));
        expect(openFile).toHaveBeenCalledWith('document.pdf');
    });

    it('calls handleChange when clear button is clicked', () => {
        render(<FileUpload file="document.pdf" handleChange={handleChange} autoFill={false} />);
        fireEvent.click(screen.getByRole('button', { name: 'general.buttons.clear' }));
        expect(handleChange).toHaveBeenCalledWith('file');
    });

    it('calls handleChange for autoFill when clearing', () => {
        render(<FileUpload file="document.pdf" handleChange={handleChange} autoFill={true} />);
        fireEvent.click(screen.getByRole('button', { name: 'general.buttons.clear' }));
        expect(handleChange).toHaveBeenCalledWith('file');
        expect(handleChange).toHaveBeenCalledWith('name');
        expect(handleChange).toHaveBeenCalledWith('date');
    });

    it('disables all buttons when disabled prop is true', () => {
        render(<FileUpload file="document.pdf" handleChange={handleChange} disabled={true} />);
        expect(screen.getByRole('button', { name: 'general.buttons.upload' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'general.buttons.clear' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'general.buttons.view' })).toBeDisabled();
    });

    it('handles null file gracefully', () => {
        render(<FileUpload file={null} handleChange={handleChange} />);
        expect(screen.queryByRole('button', { name: 'general.buttons.view' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'general.buttons.clear' })).toBeDisabled();
    });
});