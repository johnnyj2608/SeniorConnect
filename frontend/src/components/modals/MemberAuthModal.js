import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { sortSchedule } from '../../utils/formatUtils';
import FileUpload from '../inputs/FileUpload';
import TextInput from '../inputs/TextInput';
import ListDetail from '../layout/ListDetail';
import CheckboxInput from '../inputs/CheckboxInput';
import useDragAndDrop from '../../hooks/useDragDrop';

const daysOfWeek = [
    { id: 'monday', name: 'monday' },
    { id: 'thursday', name: 'thursday' },
    { id: 'tuesday', name: 'tuesday' },
    { id: 'friday', name: 'friday' },
    { id: 'wednesday', name: 'wednesday' },
    { id: 'saturday', name: 'saturday' },
    { id: 'sunday', name: 'sunday' },
];

const MemberAuthModal = ({ 
    data, 
    handleChange, 
    activeTab, 
    mltcs, 
    handleActiveToggle,
    handleAdd,
    dragStatus,
    handleLimit,
 }) => {
    const { t } = useTranslation();

    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;
    const limitIndex = current.id === 'new' ? data.length - 1 - activeTab : activeTab;

    const selectedMltc = mltcs.find(mltc => mltc.name === current.mltc);
    const dx_codes = selectedMltc?.dx_codes || [];

    const onScheduleChange = (newSchedule) => {
        const sortedSchedule = sortSchedule(newSchedule);
        handleChange('schedule')({ target: { value: sortedSchedule } });
    };

    const onDropFile = (files) => {
        const file = files[0];
        if (!file) return;

        if (!data.some(entry => !entry.deleted)) {
            handleAdd();
        }

        const fakeEvent = { target: { files: [file] } };
        handleChange('file')(fakeEvent);
    };

    const { isDragging, dragProps } = useDragAndDrop(onDropFile);

    useEffect(() => {
        if (dragStatus) dragStatus(isDragging);
        return () => {
            if (dragStatus) dragStatus(false);
        };
    }, [isDragging, dragStatus]);

    return (
        <div {...dragProps}>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('member.authorizations.label')}</h3>
                <label>
                    <input
                        type="checkbox"
                        checked={disabled ? false : current.active === true}
                        onChange={(e) => handleActiveToggle(e.target.checked)}
                        disabled={disabled}
                    />
                    {t('status.active')}
                </label>
            </div>

            <div className="member-detail">
                <label>{t('member.authorizations.mltc')} *</label>
                <select
                    required
                    value={disabled ? '' : current.mltc || ''}
                    onChange={(e) => {
                        handleChange('mltc')({ target: { value: e.target.value } });
                        handleChange('dx_code')({ target: { value: '' } });
                    }}
                    disabled={disabled}
                >
                    <option value="">{t('general.select_an_option')}</option>
                    {mltcs.map((option) => (
                        <option key={option.name} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>

            <TextInput
                label={t('member.authorizations.mltc_member_id')}
                value={disabled ? '' : current.mltc_member_id || ''}
                onChange={handleChange('mltc_member_id')}
                onLimitExceeded={handleLimit('mltc_member_id', limitIndex)}
                disabled={disabled}
                required
            />

            <TextInput
                type="date"
                label={t('member.authorizations.start_date')}
                value={current.start_date}
                onChange={handleChange('start_date')}
                disabled={disabled}
                required
            />

            <TextInput
                type="date"
                label={t('member.authorizations.end_date')}
                value={current.end_date}
                onChange={handleChange('end_date')}
                disabled={disabled}
                required
            />

            <div className="member-detail">
                <label>{t('member.authorizations.dx_code')}</label>
                <select
                    required
                    value={!disabled && dx_codes?.includes(current.dx_code) ? current.dx_code : ''}
                    onChange={handleChange('dx_code')}
                    disabled={disabled}
                >
                    <option value="">{t('general.select_an_option')}</option>
                    {dx_codes.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            <ListDetail
                label={t('member.authorizations.schedule')}
                value={
                    <CheckboxInput
                        options={daysOfWeek}
                        selectedValues={current.schedule}
                        onChange={onScheduleChange}
                        disabled={disabled}
                        translateFn={(val) => t(`general.days_of_week.${val}`)}
                    />
                }
            />

            <AuthorizationServicesTabs
                services={current.services}
                disabled={disabled}
                handleChange={handleChange}
                handleLimit={handleLimit}
                limitIndex={limitIndex}
            />

            <TextInput
                label={t('member.authorizations.care_manager')}
                value={current.cm_name}
                onChange={handleChange('cm_name')}
                onLimitExceeded={handleLimit('cm_name', limitIndex)}
                disabled={disabled}
            />

            <TextInput
                label={`↪ ${t('member.authorizations.phone')}`}
                type="number"
                value={current.cm_phone}
                onChange={handleChange('cm_phone')}
                onLimitExceeded={handleLimit('cm_phone', limitIndex)}
                maxLength={10}
                disabled={disabled}
            />

            <FileUpload 
                file={current.file}
                handleChange={handleChange}
                disabled={disabled}
            />
        </div>
    );
};

const AuthorizationServicesTabs = ({ 
    services, 
    disabled, 
    handleChange, 
    handleLimit, 
    limitIndex 
    }) => {
    const { t } = useTranslation();

    const serviceLabels = [
        { key: 'sdc', label: t('member.authorizations.sdc') },
        { key: 'transportation', label: t('member.authorizations.transportation') }
    ];

    const serviceFields = [
        {
            key: 'auth_id',
            label: t('member.authorizations.auth_id'),
            type: 'text',
        },
        {
            key: 'service_code',
            label: t('member.authorizations.service_code'),
            type: 'text',
        },
        {
            key: 'service_units',
            label: t('member.authorizations.service_units'),
            type: 'number',
        },
    ];

    const handleServiceChange = (index, field) => (event) => {
        const updatedService = {
            ...(services?.[index] || {}),
            [field]: event.target.value,
        };

        const updatedServices = [...(services || [])];
        updatedServices[index] = updatedService;

        handleChange('services')({ target: { value: updatedServices } });
    };

    const tabContent = serviceLabels.reduce((acc, { key }, index) => {
        acc[key] = (
            <div>
                {serviceFields.map(({ key: fieldKey, label, type }) => (
                <TextInput
                    key={`${key}-${fieldKey}`}
                    type={type}
                    label={label}
                    value={services?.[index]?.[fieldKey] || ''}
                    onChange={handleServiceChange(index, fieldKey)}
                    onLimitExceeded={handleLimit(fieldKey, limitIndex)}
                    disabled={disabled}
                />
                ))}
            </div>
        );
        return acc;
    }, {});

    return (
        <ListDetail
            tabs={serviceLabels}
            tabContent={tabContent}
            disabled={disabled}
        />
    );
};

export default MemberAuthModal;