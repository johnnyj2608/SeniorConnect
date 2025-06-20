import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SadcContext } from '../context/SadcContext';
import { MemberInfoModal, MemberInfoSideModal } from '../components/modals/MemberInfoModal';
import MemberAuthModal from '../components/modals/MemberAuthModal';
import MemberContactsModal from '../components/modals/MemberContactsModal';
import MemberAbsencesModal from '../components/modals/MemberAbsencesModal';
import MemberFilesModal from '../components/modals/MemberFilesModal';
import SettingsUserModal from '../components/modals/SettingsUserModal';
import SettingsMltcModal from '../components/modals/SettingsMltcModal';
import SettingsLanguageModal from '../components/modals/SettingsLanguageModal';
import SettingsDeletedModal from '../components/modals/SettingsDeletedModal';
import MembersAttendanceModal from '../components/modals/MembersAttendanceModal';
import ModalTabs from '../components/modals/ModalTabs';
import ModalQueue from '../components/modals/ModalQueue';
import DragOverlay from '../components/layout/DragOverlay';
import useModalEdit from '../hooks/useModalEdit';
import useModalQueue from '../hooks/useModalQueue';
import generateAttendance from '../utils/generateAttendance';

const ModalPage = ({ data, onClose }) => {
    const { t } = useTranslation();
    const { sadc } = useContext(SadcContext);

    const {
        type,
        localData,
        activeTab,
        handleChange,
        handleActiveToggle,
        handleAdd,
        handleDelete,
        handleSave,
        setActiveTab,
        mltcOptions,
    } = useModalEdit(data, onClose);

    const {
        queuedMembers,
        availableMembers,
        month,
        onMonthChange,
        addQueue,
        removeQueue,
        addMltcQueue,
        clearMltcQueue,
        clearQueue,
    } = useModalQueue(data);

    const [dragging, setDragging] = useState(false);

    const getModalContent = () => {
        switch (type) {
            case 'info':
                return (
                    <MemberInfoModal 
                        data={localData} 
                        handleChange={handleChange} 
                    />
                );
            case 'authorizations':
                return (
                    <MemberAuthModal
                        data={localData}
                        handleChange={handleChange}
                        activeTab={activeTab}
                        mltcOptions={mltcOptions}
                        handleActiveToggle={handleActiveToggle}
                        dragStatus={setDragging}
                    />
                );
            case 'contacts':
                return (
                    <MemberContactsModal
                        data={localData}
                        handleChange={handleChange}
                        activeTab={activeTab}
                        memberID={data.id}
                    />
                );
            case 'absences':
                return (
                    <MemberAbsencesModal
                        data={localData}
                        handleChange={handleChange}
                        activeTab={activeTab}
                    />
                );
            case 'files':
                return (
                    <MemberFilesModal
                        data={localData}
                        handleChange={handleChange}
                        activeTab={activeTab}
                        handleAdd={handleAdd}
                        dragStatus={setDragging}
                    />
                );
            case 'users':
                return (
                    <SettingsUserModal 
                        data={localData} 
                        handleChange={handleChange} 
                        activeTab={activeTab}
                        mltcOptions={mltcOptions}
                    />
                );
            case 'mltcs':
                return (
                    <SettingsMltcModal 
                        data={localData} 
                        handleChange={handleChange} 
                        activeTab={activeTab} 
                    />
                );
            case 'languages':
                return (
                    <SettingsLanguageModal 
                        data={localData} 
                        handleChange={handleChange} 
                        activeTab={activeTab} 
                    />
                );
            case 'deleted':
                return (
                    <SettingsDeletedModal 
                        data={localData} 
                        activeTab={activeTab} 
                    />
                );
            case 'attendance':
                return (
                    <MembersAttendanceModal 
                        members={availableMembers}
                        onMonthChange={onMonthChange}
                        addQueue={addQueue}
                        addMltcQueue={addMltcQueue}
                    />
                );
            default:
                return null;
        }
    };

    const add_tab = useMemo(() => ({ add: true }), []);

    const hasQueuedMembers = Object.values(queuedMembers).some(arr => arr.length > 0);
    const showDeleteButton =
        type !== 'info' &&
        localData.filter(tab => !tab.deleted).length > 0 &&
        !localData[activeTab]?.is_org_admin &&
        (type !== 'attendance' || hasQueuedMembers);

    const deleteButton = showDeleteButton ? (
        <button
            className={`action-button ${type === 'deleted' ? '' : 'destructive'}`}
            onClick={() => {
                if (type === 'attendance') {
                    clearQueue();
                } else {
                    handleDelete(activeTab);
                }
            }}
        >
        {type === 'deleted'
            ? t('general.buttons.restore')
            : type === 'attendance'
            ? t('general.buttons.clear')
            : t('general.buttons.delete')}
        </button>
    ) : null;

    const saveButton = (
        <button
            className="action-button"
            onClick={() => {
                if (type === 'attendance') {
                    generateAttendance(queuedMembers, month, sadc.attendance_template);
                    onClose();
                } else {
                    handleSave(localData);
                }
            }}
            disabled={type === 'attendance' && !hasQueuedMembers}
        >
            {type === 'attendance' ? t('general.buttons.generate') : t('general.buttons.save')}
        </button>
    );

    return (
        <div className="modal">
            <div className="modal-body">
                <div className="modal-main">
                    {type === 'info' && (
                        <div className="modal-tabs modal-tabs-info">
                            <MemberInfoSideModal data={localData} handleChange={handleChange} />
                        </div>
                    )}
                    <div className="modal-content">
                        <DragOverlay disabled={!(type === 'files' || type === 'authorizations') || !dragging} />
                        <div className={`modal-content-scroll${dragging ? ' no-scroll' : ''}`}>
                            {getModalContent()}
                        </div>
                    </div>
                    {type !== 'info' && (
                        <div className="modal-tabs">
                            {type !== 'attendance' ? (
                                <>
                                    <ModalTabs
                                        key="new-tab"
                                        index={-1}
                                        handleTabClick={handleAdd}
                                        type={type}
                                        tab={add_tab}
                                    />
                                    {localData.map((tab, index) => (
                                        <ModalTabs
                                            key={index}
                                            index={index}
                                            activeTab={activeTab}
                                            handleTabClick={setActiveTab}
                                            type={type}
                                            tab={tab}
                                        />
                                    ))}
                                </>
                            ) : (
                                <ModalQueue 
                                    members={queuedMembers}
                                    removeQueue={removeQueue}
                                    clearMltcQueue={clearMltcQueue}
                                />
                            )}
                        </div>
                    )}
                </div>
                <div className="modal-buttons-container">
                    <button className="action-button" onClick={() => onClose()}>
                        {t('general.buttons.cancel')}
                    </button>
                    {deleteButton}
                    {saveButton}
                </div>
            </div>
        </div>
    );
};

export default ModalPage;