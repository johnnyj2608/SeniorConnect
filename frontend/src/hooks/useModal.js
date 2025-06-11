import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    compareTabs,
    getActiveAuthIndex,
    getNewTab,
    sendRequest,
    saveDataTabs,
} from '../utils/modalUtils';
import { 
    validateRequiredFields, 
    validateDateRange,
    validateInputLength,
    validateMedicaid,
    confirmMltcDeletion,
 } from '../utils/validateUtils';
import fetchWithRefresh from '../utils/fetchWithRefresh'
import { useTranslation } from 'react-i18next';

function useModal(data, onClose) {
    const { t } = useTranslation();
    const id = data.id;
    const type = data.type;
    const originalData = useMemo(() => (
        Object.values(data?.data || {}).map(tab => ({ ...tab, edited: false }))
    ), [data]);

    const [localData, setLocalData] = useState(type === 'info' ? { ...data.data } : originalData);
    const [activeTab, setActiveTab] = useState(0);
    const [newTabsCount, setNewTabsCount] = useState(0);

    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    const [mltcOptions, setMltcOptions] = useState([]);
    useEffect(() => {
        if (type === 'users' || type === 'authorizations') {
          (async () => {
            try {
              const response = await fetchWithRefresh('/core/mltcs/');
              if (!response.ok) return;
    
              const data = await response.json();
              setMltcOptions(data);
            } catch (err) {
              console.error(err);
            }
          })();
        }
    }, [type]);

    const newTab = useMemo(() => {
        const base = getNewTab(type, localData, id);
        if (type === 'users' || type === 'authorizations') {
            return {
                ...base,
                allowed_mltcs: mltcOptions.map(opt => opt.id),
            };
        }
        return base;
    }, [type, localData, id, mltcOptions]);

    const handleChange = (field) => (event) => {
        const { value, files } = event.target;
        const newValue = files?.[0] ?? (field.includes('date') && value === '' ? null : value);

        setLocalData((prevData) => {
            if (type !== 'info') {
                const currentTab = prevData[activeTab];
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

    const handleActiveToggle = (checked) => {
        setLocalData((prevData) => {
            const updatedData = prevData.map((item, index) => {
                const isActive = index === activeTab ? checked : false;
                const updatedItem = { ...item, active: isActive };
                const isEdited = compareTabs(updatedItem, updatedItem.id === 'new' ? newTab : originalData[index - newTabsCount]);
                return { ...updatedItem, edited: isEdited };
            });
            return updatedData;
        });
    };

    const handleAdd = useCallback(() => {
        setLocalData((prevData) => {
            const updatedData = [...prevData];
            if (type === 'authorizations') {
                const activeAuthIndex = getActiveAuthIndex(updatedData);
                const activeAuth = updatedData[activeAuthIndex];
                if (activeAuth) {
                    const updatedTab = { ...activeAuth, active: false };
                    const isEdited = compareTabs(
                        updatedTab,
                        updatedTab.id === 'new' ? newTab : originalData[activeAuthIndex - newTabsCount]
                    );
                    updatedData[activeAuthIndex] = { ...updatedTab, edited: isEdited };
                }
            }
            updatedData.unshift(newTab);
            return updatedData;
        });
        setNewTabsCount((prevCount) => prevCount + 1);
        setActiveTab(0);
    }, [type, newTab, originalData, newTabsCount]);

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
      
        data.setData(prev => {
            if (!prev) return prev;
        
            switch (type) {
                case 'info':
                    return { ...prev, info: savedData };
                case 'contacts':
                    return { ...prev, contacts: savedData };
                case 'absences':
                    return { ...prev, absences: savedData };
                case 'files':
                    return { ...prev, files: savedData };
                case 'authorizations': {
                    const activeAuthIndex = getActiveAuthIndex(savedData);
                    if (activeAuthIndex === -1) return { ...prev, auth: null }; 
                    return { ...prev, auth: savedData[activeAuthIndex] };
                }
                default:
                    console.error("Unknown update type:", type);
                return prev;
            }
        });
    };

    const handleSave = async (updatedData) => {
        let savedData = null;
        let requiredFields = [];
        let dependentFields = [];

        switch (type) {
            case 'info':
                requiredFields = ['sadc_member_id', 'first_name', 'last_name', 'birth_date', 'gender'];
                if (!validateRequiredFields('member.info', updatedData, requiredFields)) return;
                if (!validateInputLength(updatedData.phone, 10, 'phone', t('member.info.phone'))) return;
                if (!validateInputLength(updatedData.ssn, 9, 'ssn', t('member.info.ssn'))) return;
                if (!validateMedicaid(updatedData.medicaid)) return;

                const memberEndpoint = `/core/members/${id === 'new' ? '' : id + '/'}`;
                const memberMethod = id === 'new' ? 'POST' : 'PUT';
                savedData = await sendRequest(memberEndpoint, memberMethod, updatedData);
                break;

            case 'authorizations':
                requiredFields = ['mltc_member_id', 'mltc', 'start_date', 'end_date'];
                if (!validateRequiredFields('member.authorizations', updatedData, requiredFields)) return;
                if (!validateDateRange(updatedData)) return;
                if (!validateInputLength(updatedData, 10, 'cm_phone', t('member.authorizations.phone'))) return;

                try {
                    const response = await fetchWithRefresh(`/core/members/${id}/auth/`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch member auth data');
                    }
                    const oldActiveAuth = await response.json();
                    const oldMLTC = oldActiveAuth?.mltc || null;

                    savedData = await saveDataTabs(updatedData, 'auths');
                    const activeAuth = savedData.find(auth => auth.active === true);
                    const newMLTC = activeAuth?.mltc || null;

                    sendRequest(`/core/enrollments/`, 'POST', {
                        member: id,
                        old_mltc: oldMLTC,
                        new_mltc: newMLTC,
                        change_type: !oldMLTC
                            ? 'enrollment'
                            : !newMLTC
                            ? 'disenrollment'
                            : 'transfer',
                        active_auth: activeAuth ? activeAuth.id : null,
                        change_date: activeAuth ? activeAuth.start_date : null,
                    });
                } catch (error) {
                    console.error('Error during auth fetch or enrollment update:', error);
                }
                break;

            case 'contacts':
                requiredFields = ['contact_type', 'name', 'phone'];
                dependentFields = [{ field: 'relationship_type', dependsOn: 'contact_type', value: 'emergency_contact' }];
                if (!validateRequiredFields('member.contacts', updatedData, requiredFields, dependentFields)) return;
                if (!validateInputLength(updatedData, 10, 'phone', t('member.contacts.phone'))) return;

                savedData = await saveDataTabs(updatedData, 'contacts', undefined, id);
                break;

            case 'absences':
                requiredFields = ['absence_type', 'start_date'];
                dependentFields = [
                    { field: 'time', dependsOn: 'absence_type', value: 'assessment' },
                    { field: 'user', dependsOn: 'absence_type', value: 'assessment' }
                ];
                if (!validateRequiredFields('member.absences', updatedData, requiredFields, dependentFields)) return;
                if (!validateDateRange(updatedData)) return;

                savedData = await saveDataTabs(updatedData, 'absences');
                break;

            case 'files':
                requiredFields = ['name', 'date', 'file'];
                if (!validateRequiredFields('member.files', updatedData, requiredFields)) return;

                savedData = await saveDataTabs(updatedData, 'files');
                break;

            case 'users':
                requiredFields = ['name', 'email'];
                if (!validateRequiredFields('settings.data.users', updatedData, requiredFields)) return;

                savedData = await saveDataTabs(updatedData, 'users', 'user');
                break;
            case 'mltcs':
                requiredFields = ['name'];
                if (!validateRequiredFields('settings.data.mltc', updatedData, requiredFields)) return;
                if (!confirmMltcDeletion(updatedData)) return;

                savedData = await saveDataTabs(updatedData, 'mltcs');
                break;

            default:
                console.error("Unknown save type:", type);
        }

        updateState(savedData);
        onClose(savedData?.id);
    };

    return {
        type,
        localData,
        activeTab,
        newTabsCount,
        handleChange,
        handleActiveToggle,
        handleAdd,
        handleDelete,
        handleSave,
        setActiveTab,
        mltcOptions,
    };
}

export default useModal;