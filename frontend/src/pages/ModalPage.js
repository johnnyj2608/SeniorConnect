import React, { useMemo } from 'react';
import { MemberInfoModal, MemberInfoSideModal } from '../components/modals/MemberInfoModal';
import MemberAuthModal from '../components/modals/MemberAuthModal';
import MemberContactsModal from '../components/modals/MemberContactsModal';
import MemberAbsencesModal from '../components/modals/MemberAbsencesModal';
import MemberFilesModal from '../components/modals/MemberFilesModal';
import SettingsUserModal from '../components/modals/SettingsUserModal';
import SettingsMltcModal from '../components/modals/SettingsMltcModal';
import ModalTabs from '../components/modals/ModalTabs';
import useModal from '../hooks/useModal';

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
        setActiveTab
    } = useModal(data, onClose);

    const getModalContent = () => {
        switch (type) {
            case 'info':
                return <MemberInfoModal data={localData} handleChange={handleChange} />;
            case 'authorizations':
                return <MemberAuthModal data={localData} handleChange={handleChange} activeTab={activeTab} handleActiveToggle={handleActiveToggle} />;
            case 'contacts':
                return <MemberContactsModal data={localData} handleChange={handleChange} activeTab={activeTab} memberID={data.id} />;
            case 'absences':
                return <MemberAbsencesModal data={localData} handleChange={handleChange} activeTab={activeTab} />;
            case 'files':
                return <MemberFilesModal data={localData} handleChange={handleChange} activeTab={activeTab} />;
            case 'users':
                return <SettingsUserModal data={localData} handleChange={handleChange} activeTab={activeTab} />;
            case 'mltcs':
                return <SettingsMltcModal data={localData} handleChange={handleChange} activeTab={activeTab} />;
            default:
                return null;
        }
    };

    const add_tab = useMemo(() => ({ add: true }), []);

    const showDeleteButton =
        type !== 'info' &&
        localData.filter(tab => !tab.deleted).length > 0 &&
        !localData[activeTab]?.is_org_admin;

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
                        {getModalContent()}
                    </div>
                    {type !== 'info' && (
                        <div className="modal-tabs">
                            <ModalTabs
                                key="new-tab"
                                index={-1}
                                handleTabClick={handleAdd}
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
                        </div>
                    )}
                </div>
                <div className="modal-buttons-container">
                    <button className="action-button" onClick={() => onClose()}>Cancel</button>
                    {showDeleteButton && (
                        <button
                            className="action-button destructive"
                            onClick={() => handleDelete(activeTab)}>
                            Delete
                        </button>
                    )}
                    <button className="action-button" onClick={() => handleSave(localData)}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default ModalPage;