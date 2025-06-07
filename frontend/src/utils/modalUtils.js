import fetchWithRefresh from './fetchWithRefresh';

const compareTabs = (updatedTab, originalTab) => {
    const stripEdited = ({ edited, ...rest }) => rest;
    return JSON.stringify(stripEdited(updatedTab)) !== JSON.stringify(stripEdited(originalTab));
};

const getActiveAuthIndex = (data) => {
    if (data === null) return -1;
    const activeIndex = data.findIndex(tab => tab.active === true);
    return activeIndex;
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

        if (value === null) {
            formData.append(key, '');
        } else if (key === 'members') {
            value.forEach(member => formData.append(key, member));
        } else if (Array.isArray(value) || typeof value === 'object') {
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
            return response
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
        .filter(data => !data.deleted && data.id !== 'new')
        .map(data => processedData.find(updated => updated.id === data.id) || data)
        .concat(processedData.filter(updated => !dataArray.some(data => data.id === updated.id)));
    return savedData
};

const getNewTab = (type, localData, id) => {
    switch (type) {
        case 'authorizations': {
            const activeAuthIndex = getActiveAuthIndex(localData);
            const activeAuth = localData[activeAuthIndex];
            return {
                id: 'new',
                member: id,
                mltc_member_id: activeAuth?.mltc_member_id || '',
                mltc: activeAuth?.mltc || '',
                start_date: '',
                end_date: '',
                schedule: activeAuth?.schedule || [],
                dx_code: activeAuth?.dx_code || '',
                services: [
                    activeAuth?.services?.find(s => s.service_type === 'sdc')
                        ? { ...activeAuth.services.find(s => s.service_type === 'sdc'), auth_id: '' }
                        : {
                            service_type: 'sdc',
                            auth_id: '',
                            service_code: '',
                            service_units: 0,
                        },
                    activeAuth?.services?.find(s => s.service_type === 'transportation')
                        ? { ...activeAuth.services.find(s => s.service_type === 'transportation'), auth_id: '' }
                        : {
                            service_type: 'transportation',
                            auth_id: '',
                            service_code: '',
                            service_units: 0,
                        },
                ],
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
        case 'mltcs': {
            return {
                id: 'new',
                name: '',
                dx_codes: [],
                active: true,
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
    sendRequest,
    saveDataTabs,
    getNewTab,
};