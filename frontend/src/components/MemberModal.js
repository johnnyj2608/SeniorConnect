import React, { useState, useEffect } from 'react';
import MemberPhotoModal from './modalTemplates/MemberPhotoModal';
import MemberDetailsModal from './modalTemplates/MemberDetailsModal';
import MemberAuthModal from './modalTemplates/MemberAuthModal';
import MemberContactsModal from './modalTemplates/MemberContactsModal';
import MemberAbsencesModal from './modalTemplates/MemberAbsencesModal';
import MemberFilesModal from './modalTemplates/MemberFilesModal';

const MemberModal = ({ data, onClose, onSave, type }) => {
    const [localData, setLocalData] = useState({ ...data });
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    const tabsData = [
        { id: 'new', data: {} },
        ...Object.values(data)
    ];

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
            case 'photo':
                return <MemberPhotoModal data={tabsData} handleChange={handleChange} activeTab={activeTab} />;
            case 'details':
                return <MemberDetailsModal data={tabsData} handleChange={handleChange} activeTab={activeTab} />;
            case 'authorization':
                return <MemberAuthModal data={tabsData} handleChange={handleChange} activeTab={activeTab} />;
            case 'contacts':
                return <MemberContactsModal data={tabsData} handleChange={handleChange} activeTab={activeTab} />;
            case 'absences':
                return <MemberAbsencesModal data={tabsData} handleChange={handleChange} activeTab={activeTab} />;
            case 'files':
                return <MemberFilesModal data={tabsData} handleChange={handleChange} activeTab={activeTab} />;
            default:
                return null;
        }
    };

    return (
        <div className="modal">
            <div className="modal-main">
                <div className="modal-content">
                    {getModalContent()}
                    <div className="modal-buttons">
                        <button onClick={onClose}>Cancel</button>
                        <button onClick={() => onSave(localData)}>Save</button>
                    </div>
                </div>
                <div className="modal-tabs">
                    {tabsData.map((tab, index) => (
                        <button 
                            key={index} 
                            className={`tab-button ${activeTab === index ? 'active' : ''}`} 
                            onClick={() => setActiveTab(index)}
                        >
                            {index === 0 ? 'New' : `Auth ${index}`}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MemberModal;
