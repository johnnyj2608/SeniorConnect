import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalPage from './ModalPage';
import useModalEdit from '../hooks/useModalEdit';
import useModalQueue from '../hooks/useModalQueue';
import useInputLimit from '../hooks/useInputLimit';
import generateAttendance from '../utils/generateAttendance';

jest.mock('../hooks/useModalEdit');
jest.mock('../hooks/useModalQueue');
jest.mock('../hooks/useInputLimit');
jest.mock('../utils/generateAttendance');

jest.mock('../components/modals/MemberInfoModal', () => ({
    MemberInfoModal: () => <div>MemberInfoModal</div>,
    MemberInfoSideModal: () => <div>MemberInfoSideModal</div>,
}));
jest.mock('../components/modals/MemberAuthModal', () => () => <div>MemberAuthModal</div>);
jest.mock('../components/modals/MemberContactsModal', () => () => <div>MemberContactsModal</div>);
jest.mock('../components/modals/MemberAbsencesModal', () => () => <div>MemberAbsencesModal</div>);
jest.mock('../components/modals/MemberFilesModal', () => () => <div>MemberFilesModal</div>);
jest.mock('../components/modals/SettingsUserModal', () => () => <div>SettingsUserModal</div>);
jest.mock('../components/modals/SettingsMltcModal', () => () => <div>SettingsMltcModal</div>);
jest.mock('../components/modals/SettingsGiftModal', () => () => <div>SettingsGiftModal</div>);
jest.mock('../components/modals/SettingsSadcModal', () => () => <div>SettingsSadcModal</div>);
jest.mock('../components/modals/SettingsDeletedModal', () => () => <div>SettingsDeletedModal</div>);
jest.mock('../components/modals/MembersAttendanceModal', () => () => <div>MembersAttendanceModal</div>);
jest.mock('../components/modals/ModalTabs', () => () => <div>ModalTabs</div>);
jest.mock('../components/modals/ModalQueue', () => () => <div>ModalQueue</div>);
jest.mock('../components/layout/DragOverlay', () => () => <div>DragOverlay</div>);
jest.mock('../components/modals/ModalButtons', () => ({
    CancelButton: ({ onClose }) => <button onClick={onClose}>Cancel</button>,
    DeleteButton: ({ onDelete }) => <button onClick={onDelete}>Delete</button>,
    SaveButton: ({ onSave, onGenerate, type }) => (
        <button onClick={type === 'attendance' ? onGenerate : onSave}>
            Save
        </button>
    ),
}));

describe('ModalPage', () => {
    const onCloseMock = jest.fn();

    const defaultModalEditReturn = {
        type: 'info',
        localData: [{ id: '1' }],
        activeTab: 0,
        handleChange: jest.fn(),
        handleActiveToggle: jest.fn(),
        handleAdd: jest.fn(),
        handleDelete: jest.fn(),
        handleSave: jest.fn(),
        setActiveTab: jest.fn(),
        mltcs: [],
        sadc: { languages: [], name: 'TestSadc', attendance_template: 'Template' },
        isSaving: false,
    };

    const defaultModalQueueReturn = {
        queuedMembers: {},
        availableMembers: [],
        month: '2025-09',
        onMonthChange: jest.fn(),
        addQueue: jest.fn(),
        removeQueue: jest.fn(),
        addMltcQueue: jest.fn(),
        clearMltcQueue: jest.fn(),
        clearQueue: jest.fn(),
    };

    const defaultInputLimitReturn = {
        handleLimit: jest.fn(),
        clearTabLimit: jest.fn(),
        inputLimitExceeded: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useModalEdit.mockReturnValue(defaultModalEditReturn);
        useModalQueue.mockReturnValue(defaultModalQueueReturn);
        useInputLimit.mockReturnValue(defaultInputLimitReturn);
    });

    const renderModal = (props = {}) =>
        render(<ModalPage data={{ ...defaultModalEditReturn, ...props }} onClose={onCloseMock} />);

    it('renders correct modal for info type', () => {
        renderModal();
        expect(screen.getByText('MemberInfoModal')).toBeInTheDocument();
        expect(screen.getByText('MemberInfoSideModal')).toBeInTheDocument();
    });

    it('renders correct modal for other types', () => {
        const modalTypes = [
            'authorizations',
            'contacts',
            'absences',
            'files',
            'users',
            'gifteds',
            'mltcs',
            'sadcs',
            'deleted',
        ];

        modalTypes.forEach((type) => {
            useModalEdit.mockReturnValueOnce({ ...defaultModalEditReturn, type });
            renderModal();
            const contentMap = {
                authorizations: 'MemberAuthModal',
                contacts: 'MemberContactsModal',
                absences: 'MemberAbsencesModal',
                files: 'MemberFilesModal',
                users: 'SettingsUserModal',
                gifteds: 'SettingsGiftModal',
                mltcs: 'SettingsMltcModal',
                sadcs: 'SettingsSadcModal',
                deleted: 'SettingsDeletedModal',
            };
            expect(screen.getByText(contentMap[type])).toBeInTheDocument();
        });
    });

    it('calls generateAttendance for attendance type on Save', () => {
        useModalEdit.mockReturnValueOnce({ ...defaultModalEditReturn, type: 'attendance' });
        useModalQueue.mockReturnValueOnce({ ...defaultModalQueueReturn, queuedMembers: { a: [1] } });
        renderModal();

        fireEvent.click(screen.getByText('Save'));
        expect(generateAttendance).toHaveBeenCalledWith(
            { a: [1] },
            '2025-09',
            'TestSadc',
            'Template'
        );
        expect(onCloseMock).toHaveBeenCalled();
    });
});