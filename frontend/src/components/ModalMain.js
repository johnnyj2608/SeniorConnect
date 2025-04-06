import React, { useState, useEffect } from 'react';
import { MemberBasicModal, MemberSideBasicModal } from './modalTemplates/MemberBasicModal';
import MemberAuthModal from './modalTemplates/MemberAuthModal';
import MemberContactsModal from './modalTemplates/MemberContactsModal';
import MemberAbsencesModal from './modalTemplates/MemberAbsencesModal';
import MemberFilesModal from './modalTemplates/MemberFilesModal';
import ModalTabs from './ModalTabs';
import { sortSchedule } from '../utils/formatUtils';
import getActiveAuthIndex from '../utils/getActiveAuthIndex';

const MemberModal = ({ data, onClose, onSave, type }) => {

    const originalData = [
        ...Object.values(data).map(tab => ({ ...tab, edited: false }))
    ];

    const [localData, setLocalData] = useState(type === 'basic' ? { ...data } : originalData);
    const [activeTab, setActiveTab] = useState(0);
    const [newTabsCount, setNewTabsCount] = useState(0);

    const [newTab, setNewTab] = useState(() => {
        if (type === 'authorization') {
            const activeAuthIndex = getActiveAuthIndex(localData);
            return {
                id: 'new',
                mltc_member_id: localData[activeAuthIndex]?.mltc_member_id || "",
                mltc: localData[activeAuthIndex]?.mltc || "",
                mltc_auth_id: "",
                schedule: localData[activeAuthIndex]?.schedule || [],
                start_date: "",
                end_date: "",
                dx_code: localData[activeAuthIndex]?.dx_code || "",
                sdc_code: localData[activeAuthIndex]?.sdc_code || "",
                trans_code: localData[activeAuthIndex]?.trans_code || "",
                active: true,
                edited: false
            };
        }
        return null;
    });

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
                    const isEdited = compareTabs(updatedData[index], updatedData[index].id === 'new' ? newTab : originalData[index-newTabsCount]);
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
                const isEdited = compareTabs(updatedTab, updatedTab.id === 'new' ? newTab : originalData[activeTab-newTabsCount]);

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
                const isEdited = compareTabs(updatedTab, updatedTab.id === 'new' ? newTab : originalData[activeTab-newTabsCount]);

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

    const handleAdd = () => {
        setLocalData((prevData) => {
            const updatedData = [...prevData];

            const activeAuthIndex = getActiveAuthIndex(localData);
            const activeAuth = updatedData[activeAuthIndex]
            if (activeAuth) {
                const updatedTab = {
                    ...activeAuth,
                    active: false,
                };

                const isEdited = compareTabs(updatedTab, updatedTab.id === 'new' ? newTab : originalData[activeAuthIndex-newTabsCount]);

                updatedData[activeAuthIndex] = {
                    ...updatedTab,
                    edited: isEdited,
                };
            }
            
            updatedData.unshift(newTab);
            return updatedData;
        });
        setNewTabsCount((prevCount) => prevCount + 1);
        setActiveTab(0);
    };

    const handleDelete = (tab) => {
        setLocalData((prevData) => {
            const updatedData = prevData.map((item) =>
                item === tab ? { ...item, active: false, deleted: true } : item
            );
    
            const firstNonDeletedIndex = updatedData.findIndex(tab => !tab.deleted);
            const newActiveTab = firstNonDeletedIndex === -1 ? 0 : firstNonDeletedIndex;
            setActiveTab(newActiveTab);
            
            return updatedData;
        });
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
                        <ModalTabs
                            key="new-tab"
                            index={localData.length}
                            handleTabClick={handleAdd}
                            tab={{ add: true }}
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
                <div className="modal-buttons">
                    <button onClick={onClose}>Cancel</button>
                    {type !== 'basic' && localData.filter(tab => !tab.deleted).length > 0 && (
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
