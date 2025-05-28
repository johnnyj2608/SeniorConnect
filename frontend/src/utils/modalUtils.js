import fetchWithRefresh from './fetchWithRefresh';
import { normalizeField } from './formatUtils';

const compareTabs = (updatedTab, originalTab) => {
    const stripEdited = ({ edited, ...rest }) => rest;
    return JSON.stringify(stripEdited(updatedTab)) !== JSON.stringify(stripEdited(originalTab));
};

const getActiveAuthIndex = (data) => {
    const activeIndex = data.findIndex(tab => tab.active === true);
    return activeIndex;
};

const checkMissingFields = (data, requiredFields, dependentFields = []) => {
    const items = Array.isArray(data)
        ? data.filter(item => item.edited && !item.deleted)
        : [data];

    const missingFields = items.reduce((acc, item) => {
        requiredFields.forEach(field => {
            const value = item[field];
            if (!(typeof value === 'string' ? value.trim() : value)) {
                acc.add(field);
            }
        });

        dependentFields.forEach(({ field, dependsOn, value }) => {
            if (item[dependsOn] === value) {
                const depValue = item[field];
                if (!(typeof depValue === 'string' ? depValue.trim() : depValue)) {
                    acc.add(field);
                }
            }
        });

        return acc;
    }, new Set());

    if (missingFields.size > 0) {
        alert(`Please fill in the required fields: ${[...missingFields].join(', ')}`);
        return true
    }

    return false;
};

const checkInvalidDates = (data) => {
    const invalidDates = data.reduce((acc, item) => {
        const startDate = new Date(item.start_date);
        const endDate = item.end_date ? new Date(item.end_date) : null;

        if (item.deleted !== true && endDate && endDate < startDate) {
            acc.add('start_date - end_date');
        }

        return acc;
    }, new Set());

    if (invalidDates.size > 0) {
        alert('Invalid dates: End date cannot be before start date.');
        return true;
    }

    return false;
};

const sendRequest = async (url, method, data) => {
    const excludedKeys = new Set([
        'last_login', 
        'groups', 
        'user_permissions', 
        'created_at', 
        'updated_at', 
        'is_staff', 
        'is_superuser', 
        'is_admin_user',
        'is_staff_user',
        'sadc',
        'edited',
    ]);

    const formData = new FormData();
    for (const key in data) {
        if (excludedKeys.has(key)) continue;

        let value = data[key];

        if (key.includes('type') && typeof value === 'string') {
            value = normalizeField(value)
        }

        if (value === null) {
            formData.append(key, '');
        } else if (key === 'members') {
            value.forEach(member => formData.append(key, member));
        } else if ((Array.isArray(value) || typeof value === 'object') && data.id !== 'new') {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, value);
        }
    }

    const response = await fetchWithRefresh(url, { method, body: formData });

    if (!response.ok) return Promise.reject(response);

    return response.json();
};

const saveDataTabs = async (data, endpoint, api='core', id=null) => {
    const dataArray = Object.values(data);

    const updatedData = dataArray.filter(data => data.edited && !data.deleted);
    
    const deletedData = dataArray.filter(data => data.id !== 'new' && data.deleted);

    const processedData = (await Promise.all([
        ...updatedData.map(async (item) => {
            let dataEndpoint = `/${api}/${endpoint}/`;
            const dataMethod = item.id === 'new' ? 'POST' : 'PUT';
            if (dataMethod === 'PUT') {
                dataEndpoint += `${item.id}/`;
                if (id !== null) {
                  dataEndpoint += `${id}/`;
                }
            }
            const response = await sendRequest(dataEndpoint, dataMethod, item);
    
            if (item.id === 'new' && response.id) {
                item.id = response.id;
            }
    
            return item;
        }),
        ...deletedData.map(async (item) => {
            let dataEndpoint = `/${api}/${endpoint}/${item.id}/`;
            if (id !== null) {
              dataEndpoint += `${id}/`;
            }
      
            await fetchWithRefresh(dataEndpoint, { method: 'DELETE' });
            return item;
          })
    ]));
    
    const savedData = dataArray
        .filter(data => !(data.deleted))
        .map(data => processedData.find(updated => updated.id === data.id) || data)
        .concat(processedData.filter(updated => !dataArray.some(data => data.id === updated.id)));
    return savedData
};

const getNewTab = (type, localData, id) => {
    switch (type) {
        case 'authorizations': {
            const activeAuthIndex = getActiveAuthIndex(localData);
            return {
                id: 'new',
                member: id,
                mltc_member_id: localData[activeAuthIndex]?.mltc_member_id || '',
                mltc: localData[activeAuthIndex]?.mltc || '',
                mltc_auth_id: '',
                schedule: localData[activeAuthIndex]?.schedule || [],
                start_date: '',
                end_date: '',
                dx_code: localData[activeAuthIndex]?.dx_code || '',
                sdc_code: localData[activeAuthIndex]?.sdc_code || '',
                trans_code: localData[activeAuthIndex]?.trans_code || '',
                active: true,
                edited: true,
            };
        }
        case 'contacts': {
            return {
                id: 'new',
                members: [id],
                contact_type: '',
                name: '',
                phone: '',
                relationship_type: '',
                edited: true,
            };
        }
        case 'absences': {
            return {
                id: 'new',
                member: id,
                absence_type: '',
                start_date: '',
                end_date: '',
                note: '',
                edited: true,
            };
        }
        case 'files': {
            return {
                id: 'new',
                member: id,
                name: '',
                file: '',
                completion_date: '',
                expiration_date: '',
                edited: true,
            };
        }
        case 'users': {
            return {
                id: 'new',
                name: '',
                email: '',
                role_type: '',
                is_active: true,
                edited: true,
            };
        }
        default:
            return null;
    }
};

export {
    compareTabs,
    getActiveAuthIndex,
    checkMissingFields,
    checkInvalidDates,
    sendRequest,
    saveDataTabs,
    getNewTab,
};