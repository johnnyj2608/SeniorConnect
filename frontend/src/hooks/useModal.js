import { useState, useEffect, useMemo } from 'react';
import { sortSchedule } from '../utils/formatUtils';
import { 
    compareTabs,
    getActiveAuthIndex,
    getNewTab,
    sendRequest,
    checkMissingFields,
    checkInvalidDates,
    saveDataTabs,
} from '../utils/modalUtils';

function useModal(data, onClose) {
    const id = data.id;
    const type = data.type;
    const originalData = useMemo(() => (
        Object.values(data?.data || {}).map(tab => ({ ...tab, edited: false }))
    ), [data]);

    const [localData, setLocalData] = useState(type === 'basic' ? { ...data.data } : originalData);
    const [activeTab, setActiveTab] = useState(0);
    const [newTabsCount, setNewTabsCount] = useState(0);
    const newTab = useMemo(() => getNewTab(type, localData, id), [type, localData, id]);

    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    const handleChange = (field) => (event) => {
        const { value, files, checked } = event.target;
        const normalizedValue = field.includes('date') && value === '' ? null : value;

        setLocalData((prevData) => {
            if (type !== 'basic' && field === 'active') {
                const updatedData = [...prevData];
                updatedData.forEach((item, index) => {
                    if (index === activeTab && item.active === false) {
                        updatedData[index] = { ...item, active: true };
                    } else {
                        updatedData[index] = { ...item, active: false };
                    }
                    const isEdited = compareTabs(updatedData[index], updatedData[index].id === 'new' ? newTab : originalData[index - newTabsCount]);
                    updatedData[index] = { ...updatedData[index], edited: isEdited };
                });
                return updatedData;
            }

            if (type !== 'basic') {
                const currentTab = prevData[activeTab];
                let newValue = normalizedValue;
                if (field === 'schedule') {
                    const currentSchedule = currentTab?.schedule || [];
                    const newSchedule = checked
                        ? [...currentSchedule, value]
                        : currentSchedule.filter((day) => day !== value);
                    newValue = sortSchedule(newSchedule);
                }

                if (field === 'file') {
                    newValue = files?.[0] || null;
                }

                const updatedTab = {
                    ...currentTab,
                    [field]: newValue,
                };

                const isEdited = compareTabs(updatedTab, updatedTab.id === 'new' ? newTab : originalData[activeTab - newTabsCount]);

                const updatedData = [...prevData];
                updatedData[activeTab] = {
                    ...updatedTab,
                    edited: isEdited,
                };
                return updatedData;
            }
            return { ...prevData, [field]: files?.[0] || value };
        });
    };

    const handleAdd = () => {
        setLocalData((prevData) => {
            const updatedData = [...prevData];
            const activeAuthIndex = getActiveAuthIndex(localData);
            const activeAuth = updatedData[activeAuthIndex];
            if (activeAuth) {
                const updatedTab = { ...activeAuth, active: false };
                const isEdited = compareTabs(updatedTab, updatedTab.id === 'new' ? newTab : originalData[activeAuthIndex - newTabsCount]);
                updatedData[activeAuthIndex] = { ...updatedTab, edited: isEdited };
            }
            updatedData.unshift(newTab);
            return updatedData;
        });
        setNewTabsCount((prevCount) => prevCount + 1);
        setActiveTab(0);
    };

    const handleDelete = (index) => {
        setLocalData((prevData) => {
            const updatedData = [...prevData];
            const tabToDelete = updatedData[index];
            updatedData[index] = { ...tabToDelete, active: false, deleted: true };
    
            const firstNonDeletedIndex = updatedData.findIndex(tab => !tab.deleted);
            const newActiveTab = firstNonDeletedIndex === -1 ? 0 : firstNonDeletedIndex;
            setActiveTab(newActiveTab);
            return updatedData;
        });
    };

    const updateState = (savedData) => {
        if (!data?.setData) return;

        switch (type) {
            case 'authorizations':
                const activeAuthIndex = getActiveAuthIndex(savedData);
                data.setData(savedData[activeAuthIndex]);
                break;
            case 'basic':
            case 'contacts':
            case 'absences':
            case 'files':
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

        switch (type) {
            case 'basic':
                requiredFields = ['sadc_member_id', 'first_name', 'last_name', 'birth_date', 'gender'];
                if (checkMissingFields(updatedData, requiredFields)) return;

                const memberEndpoint = `/core/members/${id === 'new' ? '' : id + '/'}`;
                const memberMethod = id === 'new' ? 'POST' : 'PUT';
                savedData = await sendRequest(memberEndpoint, memberMethod, updatedData);
                break;

            case 'authorizations':
                requiredFields = ['mltc_member_id', 'mltc', 'mltc_auth_id', 'start_date', 'end_date'];
                if (checkMissingFields(updatedData, requiredFields)) return;
                if (checkInvalidDates(updatedData)) return;

                const response = await fetch(`/core/members/${id}/auth/`);
                const oldActiveAuth = await response.json();
                const oldMLTC = oldActiveAuth?.mltc || null;

                savedData = await saveDataTabs(updatedData, 'auths');
                const activeAuth = savedData.find(auth => auth.active === true);
                const newMLTC = activeAuth?.mltc || null;

                await sendRequest(`/core/enrollments/`, 'POST', {
                    member: id,
                    old_mltc: oldMLTC,
                    new_mltc: newMLTC,
                    change_type: !oldMLTC ? 'enrollment' :
                                    !newMLTC ? 'disenrollment' : 'transfer',
                    active_auth: activeAuth ? activeAuth.id : null,
                    change_date: activeAuth ? activeAuth.start_date : null,
                });
                break;

            case 'contacts':
                requiredFields = ['contact_type', 'name', 'phone'];
                dependentFields = [{ field: 'relationship_type', dependsOn: 'contact_type', value: 'emergency' }];
                if (checkMissingFields(updatedData, requiredFields, dependentFields)) return;

                savedData = await saveDataTabs(updatedData, 'contacts', id);
                break;

            case 'absences':
                requiredFields = ['absence_type', 'start_date'];
                if (checkMissingFields(updatedData, requiredFields)) return;
                if (checkInvalidDates(updatedData)) return;

                savedData = await saveDataTabs(updatedData, 'absences');
                break;

            case 'files':
                requiredFields = ['name', 'file'];
                if (checkMissingFields(updatedData, requiredFields)) return;

                savedData = await saveDataTabs(updatedData, 'files');
                break;

            default:
                console.error("Unknown save type:", type);
        }

        updateState(savedData);
        onClose(savedData?.id);
    };

    return {
        localData,
        activeTab,
        newTabsCount,
        handleChange,
        handleAdd,
        handleDelete,
        handleSave,
        setActiveTab,
    };
}

export default useModal;