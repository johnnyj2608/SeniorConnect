import React, { useState } from 'react';
import MemberPhotoModal from './modalTemplates/MemberPhotoModal';
import MemberDetailsModal from './modalTemplates/MemberDetailsModal';
import MemberAuthModal from './modalTemplates/MemberAuthModal';
import MemberContactsModal from './modalTemplates/MemberContactsModal';
import MemberAbsencesModal from './modalTemplates/MemberAbsencesModal';
import MemberFilesModal from './modalTemplates/MemberFilesModal';

const MemberModal = ({ data, onClose, onSave, type }) => {
    const [localData, setLocalData] = useState({ ...data });

    const handleChange = (field) => (event) => {
        const { value, files } = event.target;
        if (files && files.length > 0) {
            setLocalData((prevData) => ({
                ...prevData,
                [field]: files[0],
            }));
        } else {
            setLocalData((prevData) => ({
                ...prevData,
                [field]: value,
            }));
        }
    };

    const getModalContent = () => {
        switch (type) {
            case 'photo':
                return <MemberPhotoModal data={localData} handleChange={handleChange}/>;
            case 'details':
                return <MemberDetailsModal data={localData} handleChange={handleChange} />;
            case 'authorization':
                return <MemberAuthModal data={localData} handleChange={handleChange} />;
            case 'contacts':
                return <MemberContactsModal data={localData} handleChange={handleChange} />;
            case 'absences':
                return <MemberAbsencesModal data={localData} handleChange={handleChange} />;
            case 'files':
                return <MemberFilesModal data={localData} handleChange={handleChange} />;
            default:
                return null;
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                {getModalContent()}
                <div className="modal-buttons">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={() => onSave(localData)}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default MemberModal;
