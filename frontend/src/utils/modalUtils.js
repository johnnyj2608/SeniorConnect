const urlToFile = async (url, filename) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
};

const compareTabs = (updatedTab, originalTab) => {
    const stripEdited = ({ edited, ...rest }) => rest;
    return JSON.stringify(stripEdited(updatedTab)) !== JSON.stringify(stripEdited(originalTab));
};

const getActiveAuthIndex = (data) => {
    const activeIndex = data.findIndex(tab => tab.active === true);
    return activeIndex;
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
                versions: [
                    {
                        id: 'new',
                        tab: 'new',
                        file: '',
                        completion_date: '',
                        expiration_date: '',
                        edited: true,
                    }
                ],
                edited: true,
            };
        }
        default:
            return null;
    }
};

const sendRequest = async (id, url, method, data) => {
    const formData = new FormData();
    for (const key in data) {
        if (key === 'photo' && typeof data.photo === 'string' && data.photo) {
            const file = await urlToFile(data.photo, `${id}.jpg`);
            formData.append(key, file);
        } else if (key === 'versions') {
            const versions = data[key].filter(v => v.edited && !v.deleted);
            formData.append(key, JSON.stringify(versions));

            versions.forEach((v, i) => {
                formData.append('files', v.file);
            });
        } else if (key === 'schedule' && data.id !== 'new'){
            formData.append(key, JSON.stringify(data[key]));
        } else if (data[key] === null) {
            formData.append(key, '');
        } else if (key === 'members') {
            data[key].forEach(value => formData.append(key, value));
        } else {
            formData.append(key, data[key]);
        }
    }

    const response = await fetch(url, { method, body: formData });

    if (!response.ok) return Promise.reject(response);

    return response.json();
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

const saveDataTabs = async (data, endpoint, id=null) => {
    const dataArray = Object.values(data);

    const updatedData = dataArray.filter(data => data.edited && !data.deleted);
    
    const deletedData = dataArray.filter(data => data.id !== 'new' && data.deleted);

    const processedData = (await Promise.all([
        ...updatedData.map(async (data) => {
            const dataEndpoint = `/core/${endpoint}/${data.id === 'new' ? '' : data.id + '/'}`;
            const dataMethod = data.id === 'new' ? 'POST' : 'PUT';
            const response = await sendRequest(data.member, dataEndpoint, dataMethod, data);
    
            if (data.id === 'new' && response.id) {
                data.id = response.id;
            }
    
            return data;
        }),
        ...deletedData.map(async (data) => {
            if (id === null) {
                await fetch(`/core/${endpoint}/${data.id}/`, { method: 'DELETE' });
            } else {
                await fetch(`/core/${endpoint}/${data.id}/delete/${id}/`, { method: 'DELETE' });
            }
            return data;
        })
    ]));

    const savedData = dataArray
        .filter(data => !data.deleted && data.id !== 'new')
        .map(data => processedData.find(updated => updated.id === data.id) || data)
        .concat(processedData.filter(updated => !dataArray.some(data => data.id === updated.id)));
    return savedData
};

export {
    compareTabs,
    getActiveAuthIndex,
    getNewTab,
    sendRequest,
    checkMissingFields,
    checkInvalidDates,
    saveDataTabs,
};