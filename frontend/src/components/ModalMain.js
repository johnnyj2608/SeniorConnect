import React, { useState, useEffect } from 'react';
import { MemberBasicModal, MemberSideBasicModal } from './modalTemplates/MemberBasicModal';
import MemberAuthModal from './modalTemplates/MemberAuthModal';
import MemberContactsModal from './modalTemplates/MemberContactsModal';
import MemberAbsencesModal from './modalTemplates/MemberAbsencesModal';
import MemberFilesModal from './modalTemplates/MemberFilesModal';
import ModalTabs from './ModalTabs';
import { sortSchedule } from '../utils/formatUtils';
import getActiveAuth from '../utils/getActiveAuth';

const MemberModal = ({ data, onClose, onSave, type }) => {

    let activeAuth;
    if (type === 'authorization') activeAuth = getActiveAuth(data);

    const tabsData = [
        {
            ...data?.[0],
            id: 'new',
            active: activeAuth ? false : true,
            mltc_member_id: activeAuth?.mltc_member_id || "",
            mltc: activeAuth?.mltc || "",
            mltc_auth_id: "",
            schedule: activeAuth?.schedule || [],
            start_date: "",
            end_date: "",
            dx_code: activeAuth?.dx_code || "",
            sdc_code: activeAuth?.sdc_code || "",
            trans_code: activeAuth?.trans_code || "",
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

    const compareTabs = (updatedTab, originalTab) => {
        const stripEdited = ({ edited, ...rest }) => rest;
        return JSON.stringify(stripEdited(updatedTab)) !== JSON.stringify(stripEdited(originalTab));
    };

    const handleChange = (field) => (event) => {
        const { value, files, checked } = event.target;
        setLocalData((prevData) => {
            if (type !== 'basic' && field === 'active') {
                const updatedData = [...prevData];

                updatedData.forEach((item, index) => {
                    if (index === activeTab && item.active === false) {
                        updatedData[index] = { ...item, active: true };
                    } else {
                        updatedData[index] = { ...item, active: false };
                    }
    
                    const isEdited = compareTabs(updatedData[index], tabsData[index]);
                    updatedData[index] = { ...updatedData[index], edited: isEdited };
                });
    
                return updatedData;
            }

            if (field === 'schedule') {
                const currentSchedule = prevData[activeTab]?.schedule || [];
                const newSchedule = checked
                    ? [...currentSchedule, value]
                    : currentSchedule.filter((day) => day !== value);
                const sortedSchedule = sortSchedule(newSchedule);

                const updatedTab = {
                    ...prevData[activeTab],
                    [field]: sortedSchedule,
                };
                const isEdited = compareTabs(updatedTab, tabsData[activeTab]);

                const updatedData = [...prevData];
                updatedData[activeTab] = {
                    ...updatedTab,
                    edited: isEdited,
                };
                return updatedData;
            }

            if (type !== 'basic') {
                const updatedTab = {
                    ...prevData[activeTab],
                    [field]: value,
                };
    
                const isEdited = compareTabs(updatedTab, tabsData[activeTab]);
    
                const updatedData = [...prevData];
                updatedData[activeTab] = {
                    ...updatedTab,
                    edited: isEdited,
                };
    
                return updatedData;
            }

            // Basic modal changes
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

    const handleDelete = (tab) => {
        setLocalData((prevData) =>
            prevData.map((item) =>
                item === tab ? { ...item, deleted: true } : item
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
                        { localData
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
                        <button className='delete-button' onClick={() => handleDelete(localData[activeTab])}>
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
