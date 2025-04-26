import React from 'react';
import { MemberBasicModal, MemberSideBasicModal } from '../components/modals/MemberBasicModal';
import MemberAuthModal from '../components/modals/MemberAuthModal';
import MemberContactsModal from '../components/modals/MemberContactsModal';
import MemberAbsencesModal from '../components/modals/MemberAbsencesModal';
import MemberFilesModal from '../components/modals/MemberFilesModal';
import ModalTabs from '../components/modals/ModalTabs';
import useModal from '../hooks/useModal';

const MemberModal = ({ data, onClose }) => {
    const {
        localData,
        activeTab,
        handleChange,
        handleAdd,
        handleDelete,
        handleSave,
        setActiveTab
    } = useModal(data, onClose);

    const type = data.type;

    const getModalContent = () => {
        switch (type) {
            case 'basic':
                return <MemberBasicModal data={localData} handleChange={handleChange} />;
            case 'authorizations':
                return <MemberAuthModal data={localData} handleChange={handleChange} activeTab={activeTab} />;
            case 'contacts':
                return <MemberContactsModal data={localData} handleChange={handleChange} activeTab={activeTab} memberID={data.id} />;
            case 'absences':
                return <MemberAbsencesModal data={localData} handleChange={handleChange} activeTab={activeTab} />;
            case 'files':
                return <MemberFilesModal data={localData} handleChange={handleChange} activeTab={activeTab} />;
            default:
                return null;
        }
    };

    return (
        <div className="modal">
            <div className="modal-body">
                <div className="modal-main">
                    {type === 'basic' && (
                        <div className="modal-tabs modal-tabs-basic">
                            <MemberSideBasicModal data={localData} handleChange={handleChange} />
                        </div>
                    )}
                    <div className="modal-content">
                        {getModalContent()}
                    </div>
                    {type !== 'basic' && (
                        <div className="modal-tabs">
                            <ModalTabs 
                                key="new-tab" 
                                index={localData.length} 
                                handleTabClick={handleAdd} 
                                tab={{ add: true }} />
                            {localData.map((tab, index) => (
                                <ModalTabs 
                                    key={index} 
                                    index={index} 
                                    activeTab={activeTab} 
                                    handleTabClick={setActiveTab} 
                                    type={type} 
                                    tab={tab} />
                            ))}
                        </div>
                    )}
                </div>
                <div className="modal-buttons">
                    <button onClick={() => onClose()}>Cancel</button>
                    {type !== 'basic' && localData.filter(tab => !tab.deleted).length > 0 && (
                        <button className="delete-button" onClick={() => handleDelete(localData[activeTab])}>
                            Delete
                        </button>
                    )}
                    <button onClick={() => handleSave(localData)}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default MemberModal;