import React from 'react';
import { render, screen } from '@testing-library/react';
import MemberFilesModal from './MemberFilesModal';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key, // keep i18n as-is
    }),
}));

// Mock TextInput
jest.mock('../inputs/TextInput', () => (props) => (
    <label>
        {props.label}
        <input {...props} />
    </label>
));

// Mock FileUpload
jest.mock('../inputs/FileUpload', () => (props) => (
    <label>
        {props.label || 'file-upload'}
        <input type="file" {...props} />
    </label>
));

// Mock useDragAndDrop
jest.mock('../../hooks/useDragDrop', () => () => ({
    isDragging: false,
    dragProps: {},
}));

const noop = () => {};

const mockData = [
    { id: '1', name: 'File 1', date: '2025-01-01', file: null, deleted: false },
    { id: '2', name: 'File 2', date: '2025-02-01', file: null, deleted: false },
];

describe('MemberFilesModal - core behaviors', () => {

    it('renders import mode fields as disabled', () => {
        render(
            <MemberFilesModal
                type="import"
                data={mockData}
                handleChange={noop}
                activeTab={0}
                handleAdd={noop}
                dragStatus={noop}
                handleLimit={noop}
            />
        );

        const nameInput = screen.getByLabelText('member.files.name');
        const dateInput = screen.getByLabelText('member.files.date');
        const fileUpload = screen.getByLabelText('file-upload');

        expect(nameInput).toBeDisabled();
        expect(dateInput).toBeDisabled();
        expect(fileUpload).toBeInTheDocument();
    });

    it('renders files mode fields enabled for active tabs', () => {
        render(
            <MemberFilesModal
                type="files"
                data={mockData}
                handleChange={noop}
                activeTab={0}
                handleAdd={noop}
                dragStatus={noop}
                handleLimit={noop}
            />
        );

        const nameInput = screen.getByLabelText('member.files.name');
        const dateInput = screen.getByLabelText('member.files.date');
        const fileUpload = screen.getByLabelText('file-upload');

        expect(nameInput).not.toBeDisabled();
        expect(dateInput).not.toBeDisabled();
        expect(fileUpload).toBeInTheDocument();
    });

    it('disables fields when no non-deleted tabs exist', () => {
        const deletedData = [
            { id: '1', name: 'File 1', date: '2025-01-01', file: null, deleted: true },
        ];

        render(
            <MemberFilesModal
                type="files"
                data={deletedData}
                handleChange={noop}
                activeTab={0}
                handleAdd={noop}
                dragStatus={noop}
                handleLimit={noop}
            />
        );

        const nameInput = screen.getByLabelText('member.files.name');
        const dateInput = screen.getByLabelText('member.files.date');

        expect(nameInput).toBeDisabled();
        expect(dateInput).toBeDisabled();
    });

    it('renders correct initial values from data', () => {
        render(
            <MemberFilesModal
                type="files"
                data={mockData}
                handleChange={noop}
                activeTab={1}
                handleAdd={noop}
                dragStatus={noop}
                handleLimit={noop}
            />
        );

        const nameInput = screen.getByLabelText('member.files.name');
        const dateInput = screen.getByLabelText('member.files.date');

        expect(nameInput.value).toBe('File 2');
        expect(dateInput.value).toBe('2025-02-01');
    });
});