import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MemberAbsencesModal from './MemberAbsencesModal';
import { UserContext } from '../../context/UserContext';

jest.mock('../../hooks/useDragDrop', () => () => ({ isDragging: false, dragProps: {} }));

jest.mock('../inputs/FileUpload', () => (props) => <div data-testid="file-upload" {...props} />);
jest.mock('../inputs/TextInput', () => (props) => <input data-testid={props.label} {...props} />);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('MemberAbsencesModal - core behaviors', () => {
    const handleChange = jest.fn((field) => jest.fn());
    const handleLimit = jest.fn(() => jest.fn());
    const noop = () => {};

    const users = [
        { id: 1, name: 'User One' },
        { id: 2, name: 'User Two' },
    ];

    const renderModal = (data) =>
        render(
            <UserContext.Provider value={{ users }}>
                <MemberAbsencesModal
                    data={data}
                    activeTab={0}
                    handleChange={handleChange}
                    handleAdd={noop}
                    handleLimit={handleLimit}
                    dragStatus={noop}
                />
            </UserContext.Provider>
        );

    it('renders vacation absence fields', () => {
        const data = [{ id: 'new', absence_type: 'vacation', start_date: '2025-09-20', end_date: '2025-09-21', note: '', called: true }];
        renderModal(data);

        expect(screen.getByTestId('member.absences.start_date')).toBeInTheDocument();
        expect(screen.getByTestId('member.absences.end_date')).toBeInTheDocument();
        expect(screen.getByTestId('general.note')).toBeInTheDocument();
        expect(screen.getByText('member.absences.called')).toBeInTheDocument();
    });

    it('renders assessment fields', () => {
        const data = [{ id: 'new', absence_type: 'assessment', start_date: '2025-09-20', time: '10:00', note: '', user: 1 }];
        renderModal(data);

        expect(screen.getByTestId('member.absences.date')).toBeInTheDocument();
        expect(screen.getByTestId('member.absences.time')).toBeInTheDocument();

        expect(screen.getByText('User One')).toBeInTheDocument();
    });

    it('calls handleChange on absence_type change', () => {
        const data = [{ id: 'new', absence_type: '', start_date: '', note: '', called: false }];
        renderModal(data);

        const select = screen.getAllByRole('combobox')[0];
        fireEvent.change(select, { target: { value: 'vacation' } });

        expect(handleChange).toHaveBeenCalledWith('absence_type');
    });

    it('calls handleLimit when typing note', () => {
        const data = [{ id: 'new', absence_type: 'vacation', start_date: '', end_date: '', note: '' }];
        renderModal(data);

        const noteInput = screen.getByTestId('general.note');
        fireEvent.change(noteInput, { target: { value: 'test note' } });

        expect(handleLimit).toHaveBeenCalled();
    });
});