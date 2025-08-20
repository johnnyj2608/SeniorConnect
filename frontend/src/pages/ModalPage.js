import React, { useMemo, useState } from 'react';
import { MemberInfoModal, MemberInfoSideModal } from '../components/modals/MemberInfoModal';
import MemberAuthModal from '../components/modals/MemberAuthModal';
import MemberContactsModal from '../components/modals/MemberContactsModal';
import MemberAbsencesModal from '../components/modals/MemberAbsencesModal';
import MemberFilesModal from '../components/modals/MemberFilesModal';
import SettingsUserModal from '../components/modals/SettingsUserModal';
import SettingsMltcModal from '../components/modals/SettingsMltcModal';
import SettingsGiftModal from '../components/modals/SettingsGiftModal';
import SettingsSadcModal from '../components/modals/SettingsSadcModal';
import SettingsDeletedModal from '../components/modals/SettingsDeletedModal';
import MembersAttendanceModal from '../components/modals/MembersAttendanceModal';
import ModalTabs from '../components/modals/ModalTabs';
import ModalQueue from '../components/modals/ModalQueue';
import DragOverlay from '../components/layout/DragOverlay';
import useModalEdit from '../hooks/useModalEdit';
import useModalQueue from '../hooks/useModalQueue';
import useInputLimit from '../hooks/useInputLimit';
import generateAttendance from '../utils/generateAttendance';
import { CancelButton, DeleteButton, SaveButton } from '../components/modals/ModalButtons';

const DRAG_DROP_TYPES = new Set(['authorizations', 'files', 'import', 'absences']);
const NO_TABS_TYPE = new Set(['info', 'sadcs', 'import']);
const FULL_WIDTH_TYPES = new Set(['sadcs', 'import']);

const ModalPage = ({ data, onClose }) => {

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
        mltcs,
        sadc,
    } = useModalEdit(data, onClose, NO_TABS_TYPE);

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

    const {
        handleLimit,
        clearTabLimit,
        inputLimitExceeded,
    } = useInputLimit();

    const [dragging, setDragging] = useState(false);

    const getModalContent = () => {
        switch (type) {
            case 'info':
                return (
                    <MemberInfoModal 
                        data={localData} 
                        handleChange={handleChange} 
                        handleLimit={handleLimit}
                    />
                );
            case 'authorizations':
                return (
                    <MemberAuthModal
                        data={localData}
                        handleChange={handleChange}
                        activeTab={activeTab}
                        mltcs={mltcs}
                        handleActiveToggle={handleActiveToggle}
                        handleAdd={handleAdd}
                        dragStatus={setDragging}
                        handleLimit={handleLimit}
                    />
                );
            case 'contacts':
                return (
                    <MemberContactsModal
                        data={localData}
                        handleChange={handleChange}
                        activeTab={activeTab}
                        memberID={data.id}
                        handleLimit={handleLimit}
                    />
                );
            case 'absences':
                return (
                    <MemberAbsencesModal
                        data={localData}
                        handleChange={handleChange}
                        activeTab={activeTab}
                        handleAdd={handleAdd}
                        dragStatus={setDragging}
                        handleLimit={handleLimit}
                    />
                );
            case 'files':
            case 'import':
                return (
                    <MemberFilesModal
                        type={type}
                        data={localData}
                        handleChange={handleChange}
                        activeTab={activeTab}
                        handleAdd={handleAdd}
                        dragStatus={setDragging}
                        handleLimit={handleLimit}
                    />
                );
            case 'users':
                return (
                    <SettingsUserModal 
                        data={localData} 
                        handleChange={handleChange} 
                        activeTab={activeTab}
                        mltcs={mltcs}
                        handleLimit={handleLimit}
                    />
                );
            case 'gifteds':
            case 'gifts':
                return (
                    <SettingsGiftModal 
                        type={type}
                        data={localData} 
                        handleChange={handleChange} 
                        activeTab={activeTab}
                        mltcs={mltcs}
                        handleLimit={handleLimit}
                    />
                );
            case 'mltcs':
                return (
                    <SettingsMltcModal 
                        data={localData} 
                        handleChange={handleChange} 
                        activeTab={activeTab} 
                        handleLimit={handleLimit}
                    />
                );
            case 'sadcs':
                return (
                    <SettingsSadcModal 
                        data={localData} 
                        handleChange={handleChange} 
                        handleLimit={handleLimit}
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
        !NO_TABS_TYPE.has(type) &&
        localData.filter(tab => !tab.deleted).length > 0 &&
        !localData[activeTab]?.is_org_admin &&
        (type !== 'attendance' || hasQueuedMembers);

    const handleDeleteClick = () => {
        handleDelete(activeTab);
        const limitIndex = localData[activeTab]?.id === 'new'
            ? localData.length - 1 - activeTab
            : activeTab;
        clearTabLimit(limitIndex);
    }

    return (
        <div className="modal">
            <div className="modal-body">
                <div className="modal-main">
                    {type === 'info' && (
                        <div className="modal-tabs modal-tabs-info">
                            <MemberInfoSideModal 
                                data={localData}
                                handleChange={handleChange}
                                languages={sadc.languages}
                            />
                        </div>
                    )}
                    <div className={`modal-content${FULL_WIDTH_TYPES.has(type) ? ' full-width' : ''}`}>
                        <DragOverlay disabled={!DRAG_DROP_TYPES.has(type) || !dragging} />
                        <div className={`modal-content-scroll${dragging ? ' no-scroll' : ''}`}>
                            {getModalContent()}
                        </div>
                    </div>
                    {!NO_TABS_TYPE.has(type) && (
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
                    <CancelButton onClose={onClose} />
                    <DeleteButton 
                        type={type}
                        showDeleteButton={showDeleteButton}
                        onDelete={handleDeleteClick}
                        onClearQueue={clearQueue}
                    />
                    <SaveButton 
                        type={type}
                        hasQueuedMembers={hasQueuedMembers}
                        inputLimitExceeded={inputLimitExceeded}
                        onSave={() => handleSave(localData)}
                        onGenerate={() => {
                            generateAttendance(queuedMembers, month, sadc.name, sadc.attendance_template);
                            onClose();
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ModalPage;