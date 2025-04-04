import React, { useState, useEffect } from 'react';
import { MemberBasicModal, MemberSideBasicModal } from './modalTemplates/MemberBasicModal';
import MemberAuthModal from './modalTemplates/MemberAuthModal';
import MemberContactsModal from './modalTemplates/MemberContactsModal';
import MemberAbsencesModal from './modalTemplates/MemberAbsencesModal';
import MemberFilesModal from './modalTemplates/MemberFilesModal';
import ModalTabs from './ModalTabs';

const MemberModal = ({ data, onClose, onSave, type }) => {
    const tabsData = [
        {
            id: 'new',
            ...data && data[0]
              ? {
                  ...data[0],
                  id: 'new',
                  mltc_auth_id: null,
                  start_date: null,
                  end_date: null,
                  active: false,
                }
              : {},
            edited: false,
          },
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
        const { value, files, checked } = event.target;
        
        setLocalData((prevData) => {
            if (type !== 'basic' && field === 'active') {
                const updatedData = prevData.map((item, index) => {
                    if (index === activeTab && item.active === false) {
                        return { ...item, active: true };   // Manage edited field
                    } else {
                        return { ...item, active: false };  // Manage edited field
                    }
                });
                return updatedData;
            }

            if (field === 'schedule') {
                const currentSchedule = prevData[activeTab]?.schedule || [];
                const newSchedule = checked
                    ? [...currentSchedule, value]
                    : currentSchedule.filter((day) => day !== value);

                return {
                    ...prevData,
                    [activeTab]: {
                        ...prevData[activeTab],
                        field: newSchedule,
                        // Manage edited field
                    },
                };
            }

            if (type !== 'basic') {
                return {
                    ...prevData,
                    [activeTab]: {
                        ...prevData[activeTab],
                        [field]: value,
                        edited: tabsData[activeTab][field] !== value,
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

    const handleDelete = (tabIndex) => {
        setLocalData((prevData) =>
            prevData.map((item, index) =>
                index === tabIndex ? { ...item, deleted: true } : item
            )
        );
        setActiveTab(0);
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
                        { Object.values(localData)
                            .filter(tab => !tab.deleted)
                            .map((tab, index) => {
                            return (
                                <ModalTabs 
                                    key={index}
                                    index={index}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    type={type}
                                    tab={tab}
                                />
                            );
                        })}
                    </div>
                )}
                </div>
                <div className="modal-buttons">
                    <button onClick={onClose}>Cancel</button>
                    {type !== 'basic' && activeTab !== 0 && (
                        <button className='delete-button' onClick={() => handleDelete(activeTab)}>
                            Delete
                        </button>
                    )}
                    <button onClick={() => onSave(localData)}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default MemberModal;
