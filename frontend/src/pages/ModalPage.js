import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import urlToFile from '../utils/urlToFile';
import { MemberBasicModal, MemberSideBasicModal } from '../components/memberModalTemplates/MemberBasicModal';
import MemberAuthModal from '../components/memberModalTemplates/MemberAuthModal';
import MemberContactsModal from '../components/memberModalTemplates/MemberContactsModal';
import MemberAbsencesModal from '../components/memberModalTemplates/MemberAbsencesModal';
import MemberFilesModal from '../components/memberModalTemplates/MemberFilesModal';
import ModalTabs from '../components/ModalTabs';
import { sortSchedule } from '../utils/formatUtils';
import compareTabs from '../utils/compareTabs';
import getActiveAuthIndex from '../utils/getActiveAuthIndex';

const MemberModal = ({ data, onClose }) => {
    const navigate = useNavigate();
    const id = data.id;
    const type = data.type;
    const originalData = [
        ...Object.values(data.data).map(tab => ({ ...tab, edited: false }))
    ];

    const [localData, setLocalData] = useState(type === 'basic' ? { ...data.data } : originalData);
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
                data.setData(savedData);
                break;
            default:
                console.error("Unknown update type:", type);
                return;
        }
    };

    const handleSave = async (updatedData) => {
        const sendRequest = async (url, method, data) => {
            const formData = new FormData();
            for (const key in data) {
            if (key === 'photo' && typeof data.photo === 'string' && data.photo) {
                const file = await urlToFile(data.photo, `${id}.jpg`);
                formData.append('photo', file);
            } else if (key === 'schedule' && data.id !== 'new') {
                formData.append(key, JSON.stringify(data[key]));
            } else if (data[key] === null) {
                formData.append(key, '');
            } else {
                formData.append(key, data[key]);
            }
            }

            const response = await fetch(url, { method, body: formData });

            if (!response.ok) return Promise.reject(response);

            return response.json();
        };

        const dataArray = Object.values(updatedData);
        let savedData = null;
        let requiredFields = [];
        let missingFields = [];

        switch (type) {
            case 'basic':
                requiredFields = ['sadc_member_id', 'first_name', 'last_name', 'birth_date', 'gender']

                missingFields = requiredFields.filter(field => {
                    const value = updatedData[field];
                    return !(typeof value === 'string' ? value.trim() : value);
                });

                if (missingFields?.length > 0) {
                    alert(`Please fill in the required fields: ${missingFields.join(', ')}`);
                    return;
                }

                const memberEndpoint = `/core/members/${id === 'new' ? '' : id + '/'}`;
                const memberMethod = id === 'new' ? 'POST' : 'PUT';
                savedData = await sendRequest(memberEndpoint, memberMethod, updatedData);
                
                if (id === 'new') {
                    navigate(`/member/${savedData.id}`);
                }

                break;

            case 'authorization':
                requiredFields = ['mltc_member_id', 'mltc', 'mltc_auth_id', 'start_date', 'end_date']

                const deletions = dataArray.filter(auth => auth.id !== 'new' && auth.deleted);
                const updates = dataArray.filter(auth => auth.edited && !auth.deleted);

                missingFields = updates.reduce((acc, auth) => {
                    const missingFieldsInAuth = requiredFields.filter(field => {
                    const value = auth[field];
                    return !(typeof value === 'string' ? value.trim() : value);
                    });
                
                    if (missingFieldsInAuth.length > 0) {
                    acc.push(...missingFieldsInAuth);
                    }
                
                    return acc;
                }, []);
            
                if (missingFields.length > 0) {
                    alert(`Please fill in the required fields: ${missingFields.join(', ')}`);
                    return;
                }

                const updatedAuths = await Promise.all(
                    updates.map(async (auth) => {
                    auth.member_id = auth.id === 'new' ? id : auth.member_id;
                    const authEndpoint = `/core/auths/${auth.id === 'new' ? '' : auth.id + '/'}`;
                    const authMethod = auth.id === 'new' ? 'POST' : 'PUT';
                
                    const response = await sendRequest(authEndpoint, authMethod, auth);

                    if (auth.id === 'new' && response.id) {
                        auth.id = response.id;
                    }

                    return auth;
                    })
                );

                await Promise.all(
                    deletions.map(auth => fetch(`/core/auths/${auth.id}/`, { method: 'DELETE' }))
                );
            
                savedData = dataArray
                    .filter(auth => !auth.deleted && auth.id !== 'new')
                    .map(auth => updatedAuths.find(updated => updated.id === auth.id) || auth)
                    .concat(updatedAuths.filter(updated => !dataArray.some(auth => auth.id === updated.id)));
                break;

            default:
                console.error("Unknown save type:", type);
        }
        updateState(savedData);
        onClose();
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
                    <button onClick={() => handleSave(localData)}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default MemberModal;
