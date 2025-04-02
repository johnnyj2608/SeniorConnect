import React, { useState, useEffect } from 'react';
import { MemberBasicModal, MemberSideBasicModal } from './modalTemplates/MemberBasicModal';
import MemberAuthModal from './modalTemplates/MemberAuthModal';
import MemberContactsModal from './modalTemplates/MemberContactsModal';
import MemberAbsencesModal from './modalTemplates/MemberAbsencesModal';
import MemberFilesModal from './modalTemplates/MemberFilesModal';
import ModalTabs from './ModalTabs';

const MemberModal = ({ data, onClose, onSave, type }) => {
    const tabsData = [
        { id: 'new', data: {}, edited: false },
        ...Object.values(data).map(tab => ({ ...tab, edited: false }))
    ];
    
    const [localData, setLocalData] = useState(type === 'basic' ? { ...data } : tabsData);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    const handleChange = (field) => (event) => {
        const { value, files } = event.target;
        
        setLocalData((prevData) => {
            if (type !== 'basic') {
                return {
                    ...prevData,
                    [activeTab]: {
                        ...prevData[activeTab],
                        [field]: value,
                        edited: true,
                    },
                };
            }

            if (files && files.length > 0) {
                return { ...prevData, [field]: files[0] };
            }
            return { ...prevData, [field]: value };
        });
    };

    const getModalContent = () => {
        switch (type) {
            case 'basic':
                return <MemberBasicModal data={localData} handleChange={handleChange} />;
            case 'authorization':
                return <MemberAuthModal data={localData} handleChange={handleChange} activeTab={activeTab} />;
            case 'contacts':
                return <MemberContactsModal data={localData} handleChange={handleChange} activeTab={activeTab} />;
            case 'absences':
                return <MemberAbsencesModal data={localData} handleChange={handleChange} activeTab={activeTab} />;
            case 'files':
                return <MemberFilesModal data={localData} handleChange={handleChange} activeTab={activeTab} />;
            default:
                return null;
        }
    };

    const getTabLabel = (type, item, index) => {
        const isEdited = localData[index]?.edited;

        if (index === 0) {
            return { heading: 'New', subheading: '', isEdited };
        }

        switch (type) {
            case 'authorization':
                return { 
                    heading: item.mltc?.name || 'Unknown', 
                    subheading: item.mltc_auth_id || '', 
                    isEdited 
                };
            default:
                return { heading: 'Unknown', subheading: '', isEdited };
        }
    };

    return (
        <div className="modal">
            <div className="modal-body">
                <div className="modal-main">
                    {type === 'basic' && (
                        <div className="modal-tabs">
                            <MemberSideBasicModal data={localData} handleChange={handleChange} />
                        </div>
                    )}
                    <div className="modal-content">
                        {getModalContent()}
                    </div>
                    {type !== 'basic' && (
                    <div className="modal-tabs">
                        {tabsData.map((tab, index) => {
                            const { heading, subheading, isEdited } = getTabLabel(type, tab, index);
                            return (
                                <ModalTabs 
                                    key={index}
                                    index={index}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    heading={heading}
                                    subheading={subheading}
                                    isEdited={isEdited}
                                />
                            );
                        })}
                    </div>
                )}
                </div>
                <div className="modal-buttons">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={() => onSave(localData)}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default MemberModal;
