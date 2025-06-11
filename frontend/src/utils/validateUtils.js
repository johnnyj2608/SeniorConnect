import { t } from 'i18next';

const validateRequiredFields = (translationPath, data, requiredFields, dependentFields = []) => {
    const items = Array.isArray(data)
        ? data.filter(item => item.edited && !item.deleted)
        : [data];

    const missingFields = items.reduce((acc, item) => {
        requiredFields.forEach(field => {
            const value = item[field];
            const isEmpty = typeof value === 'string' ? value.trim() === '' : value == null;

            if (isEmpty) acc.add(field);
        });

        dependentFields.forEach(({ field, dependsOn, value }) => {
            if (item[dependsOn] === value) {
                const depValue = item[field];
                const isEmpty = typeof depValue === 'string' ? depValue.trim() === '' : depValue == null;
                if (isEmpty) {
                    acc.add(field);
                }
            }
        });

        return acc;
    }, new Set());

    if (missingFields.size > 0) {
        const translatedFields = [...missingFields].map(fieldKey =>
            t(`${translationPath}.${fieldKey}`)
        );

        alert(t('alerts.required_fields', { fields: translatedFields.join(', ') }));
        return false;
    }

    return true;
};

const validateDateRange = (data) => {
    const hasInvalid = data.some(item => {
        if (item.deleted) return false;
        const startDate = new Date(item.start_date);
        const endDate = item.end_date ? new Date(item.end_date) : null;
        return endDate && endDate < startDate;
    });
  
    if (hasInvalid) {
        alert(t('alerts.invalid_dates'));
        return false;
    }
  
    return true;
};
  

const validateInputLength = (data, length, field, translation) => {
    const items = Array.isArray(data)
        ? data.filter(item => !item.deleted)
        : [{ [field]: data }];

    const hasInvalid = items.some(item => {
        const value = item[field];
        return value != null && String(value).trim() !== '' && String(value).trim().length !== length;
    });
    
    if (hasInvalid) {
        alert(t('alerts.exact_length', { translation, length }));
        return false;
    }

    return true;
};

const validateMedicaid = (data) => {
    if (data === null || data === undefined || String(data).trim() === '') {
        return true;
    }

    const medicaidPattern = /^[a-zA-Z]{2}\d{5}[a-zA-Z]$/;
    if (!medicaidPattern.test(data.trim())) {
        alert(t('alerts.invalid_medicaid'));
        return false;
    }

    return true;
};

const confirmMltcDeletion = (items) => {
    const deletedItems = items.filter(item => item.deleted);
    if (deletedItems.length === 0) return true;

    const names = deletedItems.map(item => item.name);
    const message = t('alerts.confirm_deletion', {
        plural: names.length > 1 ? 's' : '',
        names: names.join('\n- ')
    });
    return window.confirm(message);
};

export {
    validateRequiredFields,
    validateDateRange,
    validateInputLength,
    validateMedicaid,
    confirmMltcDeletion,
};