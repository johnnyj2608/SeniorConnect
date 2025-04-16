import urlToFile from '../utils/urlToFile';

const sendRequest = async (id, url, method, data) => {
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

const checkMissingFields = (data, requiredFields, dependentFields) => {
    console.log(data)
    const items = Array.isArray(data)
        ? data.filter(item => item.edited && !item.deleted)
        : [data];

    return items.reduce((acc, item) => {
        requiredFields.forEach(field => {
            const value = item[field];
            if (!(typeof value === 'string' ? value.trim() : value)) {
                acc.add(field);
            }
        });
        return acc;
    }, new Set());
};

const saveDataTabs = async (data, endpoint) => {
    const dataArray = Object.values(data);

    const updatedData = dataArray.filter(data => data.edited && !data.deleted);
    
    const deletedData = dataArray.filter(data => data.id !== 'new' && data.deleted);

    const processedData = (await Promise.all([
        ...updatedData.map(async (data) => {
            const dataEndpoint = `/core/${endpoint}/${data.id === 'new' ? '' : data.id + '/'}`;
            const dataMethod = data.id === 'new' ? 'POST' : 'PUT';
            const response = await sendRequest(data.member_id, dataEndpoint, dataMethod, data);
    
            if (data.id === 'new' && response.id) {
                data.id = response.id;
            }
    
            return data;
        }),
        ...deletedData.map(data => fetch(`/core/${endpoint}/${data.id}/`, { method: 'DELETE' })),
    ])).filter(item => !(item instanceof Response));

    const savedData = dataArray
        .filter(data => !data.deleted && data.id !== 'new')
        .map(data => processedData.find(updated => updated.id === data.id) || data)
        .concat(processedData.filter(updated => !dataArray.some(data => data.id === updated.id)));
    return savedData
};

export {
    sendRequest,
    checkMissingFields,
    saveDataTabs,
};