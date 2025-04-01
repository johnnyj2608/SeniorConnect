import React, { useState, useEffect } from 'react';
import { MemberBasicModal, MemberSideBasicModal } from './modalTemplates/MemberBasicModal';
import MemberAuthModal from './modalTemplates/MemberAuthModal';
import MemberContactsModal from './modalTemplates/MemberContactsModal';
import MemberAbsencesModal from './modalTemplates/MemberAbsencesModal';
import MemberFilesModal from './modalTemplates/MemberFilesModal';
import ModalTabs from './ModalTabs';

const MemberModal = ({ data, onClose, onSave, type }) => {
    const tabsData = [
        { id: 'new', data: {} },
        ...Object.values(data)
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
        const { type, value, checked, files } = event.target;
    
        setLocalData((prevData) => {
            if (files && files.length > 0) {
                return { ...prevData, [field]: files[0] };
            }
    
            if (type === "checkbox") {
                if (field === "schedule") {
                    return {
                        ...prevData,
                        schedule: prevData.schedule.includes(value)
                            ? prevData.schedule.filter((day) => day !== value)
                            : [...prevData.schedule, value],
                    };
                }
                return { ...prevData, [field]: checked };
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
        if (index === 0) {
            return { heading: 'New', subheading: '' };
        }

        switch (type) {
            case 'authorization':
                return { heading: item.mltc?.name || 'Unknown', subheading: item.mltc_auth_id || '' };
            default:
                return { heading: 'Unknown', subheading: '' };
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
                            const { heading, subheading } = getTabLabel(type, tab, index);
                            return (
                                <ModalTabs 
                                    key={index}
                                    index={index}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    heading={heading}
                                    subheading={subheading}
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
