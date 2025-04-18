import React, { useState, useEffect } from 'react';
import { MemberBasicModal, MemberSideBasicModal } from '../components/memberModalTemplates/MemberBasicModal';
import MemberAuthModal from '../components/memberModalTemplates/MemberAuthModal';
import MemberContactsModal from '../components/memberModalTemplates/MemberContactsModal';
import MemberAbsencesModal from '../components/memberModalTemplates/MemberAbsencesModal';
import MemberFilesModal from '../components/memberModalTemplates/MemberFilesModal';
import ModalTabs from '../components/ModalTabs';
import { sortSchedule } from '../utils/formatUtils';
import compareTabs from '../utils/compareTabs';
import getActiveAuthIndex from '../utils/getActiveAuthIndex';
import { sendRequest, checkMissingFields, saveDataTabs } from '../utils/saveData';
import getNewTab from '../utils/getNewTab';

const MemberModal = ({ data, onClose }) => {
    const id = data.id;
    const type = data.type;
    const originalData = [
        ...Object.values(data?.data || {}).map(tab => ({ ...tab, edited: false }))
    ];

    const [localData, setLocalData] = useState(type === 'basic' ? { ...data.data } : originalData);
    const [activeTab, setActiveTab] = useState(0);
    const [newTabsCount, setNewTabsCount] = useState(0);

    const [newTab] = useState(() => {
        return getNewTab(type, localData, id);
    });

    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    const getModalContent = () => {
        switch (type) {
            case 'basic':
                return <MemberBasicModal 
                    data={localData} 
                    handleChange={handleChange} />;
            case 'authorization':
                return <MemberAuthModal 
                    data={localData} 
                    handleChange={handleChange} 
                    activeTab={activeTab} />;
            case 'contacts':
                return <MemberContactsModal 
                    data={localData} 
                    handleChange={handleChange} 
                    activeTab={activeTab}
                    memberID={id} />;
            case 'absences':
                return <MemberAbsencesModal 
                    data={localData} 
                    handleChange={handleChange} 
                    activeTab={activeTab} />;
            case 'files':
                return <MemberFilesModal 
                    data={localData} 
                    handleChange={handleChange} 
                    activeTab={activeTab} />;
            default:
                return null;
        }
    };

    const handleChange = (field) => (event) => {

        const { value, files, checked } = event.target;
        setLocalData((prevData) => {
            if (type !== 'basic' && field === 'active') {   // Updates all tabs
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

            if (type !== 'basic') { // Updates single tab
                const currentTab = prevData[activeTab];
                let newValue = value;

                if (field === 'schedule') {
                    const currentSchedule = currentTab?.schedule || [];
                    const newSchedule = checked
                        ? [...currentSchedule, value]
                        : currentSchedule.filter((day) => day !== value);
                    newValue = sortSchedule(newSchedule);
                }
                const updatedTab = {
                    ...currentTab,
                    [field]: newValue,
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
            return { ...prevData, [field]: files?.[0] || value };
        });
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

    const updateState = (savedData) => {
        if (!data?.setData) return;
        
        switch (type) {
            case 'basic':
                let photoURL = ''
                if (savedData.photo) photoURL = `${savedData.photo}?t=${new Date().getTime()}`;
                data.setData({
                    ...savedData,
                    photo: photoURL,
                });
                break;
            case 'authorization':
            case 'contacts':
                data.setData(savedData);
                break;
            default:
                console.error("Unknown update type:", type);
                return;
        }
    };

    const handleSave = async (updatedData) => {
        
        let savedData = null;
        let requiredFields = [];
        let dependentFields = [];
        let missingFields = new Set();

        switch (type) {
            case 'basic':
                requiredFields = ['sadc_member_id', 'first_name', 'last_name', 'birth_date', 'gender']

                missingFields = checkMissingFields(updatedData, requiredFields);
                if (missingFields.size > 0) {
                    alert(`Please fill in the required fields: ${[...missingFields].join(', ')}`);
                    return;
                }

                const memberEndpoint = `/core/members/${id === 'new' ? '' : id + '/'}`;
                const memberMethod = id === 'new' ? 'POST' : 'PUT';
                savedData = await sendRequest(id, memberEndpoint, memberMethod, updatedData);
                break;

            case 'authorization':
                requiredFields = ['mltc_member_id', 'mltc', 'mltc_auth_id', 'start_date', 'end_date'];

                missingFields = checkMissingFields(updatedData, requiredFields);
                if (missingFields.size > 0) {
                    alert(`Please fill in the required fields: ${[...missingFields].join(', ')}`);
                    return;
                }

                savedData = await saveDataTabs(updatedData, 'auths');
                break;

            case 'contacts':
                requiredFields = ['contact_type', 'name', 'phone'];
                dependentFields = [
                    {
                        field: 'relationship_type',
                        dependsOn: 'contact_type',
                        value: 'emergency',
                    }
                ];

                missingFields = checkMissingFields(updatedData, requiredFields, dependentFields);
                if (missingFields.size > 0) {
                    alert(`Please fill in the required fields: ${[...missingFields].join(', ')}`);
                    return;
                }

                savedData = await saveDataTabs(updatedData, 'contacts');
                break;

            default:
                console.error("Unknown save type:", type);
        }
        updateState(savedData);
        onClose(savedData?.id);
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
                    <button onClick={() => onClose()}>Cancel</button>
                    {type !== 'basic' && localData.filter(tab => !tab.deleted).length > 0 && (
                        <button className='delete-button' onClick={() => handleDelete(localData[activeTab])}>
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
