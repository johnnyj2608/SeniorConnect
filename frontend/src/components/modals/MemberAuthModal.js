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

const MemberAuthModal = ({ data, handleChange, activeTab, mltcOptions, handleActiveToggle, dragStatus }) => {
    const { t } = useTranslation();
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    const selectedMltc = mltcOptions.find(mltc => mltc.name === current.mltc);
    const dx_codes = selectedMltc?.dx_codes || [];

    const onScheduleChange = (newSchedule) => {
        const sortedSchedule = sortSchedule(newSchedule);
        handleChange('schedule')({ target: { value: sortedSchedule } });
    };

    const onDropFile = (files) => {
        const file = files[0];
        if (!file) return;

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
                    {mltcOptions.map((option) => (
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
            />

            <TextInput
                label={t('member.authorizations.care_manager')}
                value={current.cm_name}
                onChange={handleChange('cm_name')}
                disabled={disabled}
            />

            <TextInput
                label={`↪ ${t('member.authorizations.phone')}`}
                type="number"
                value={current.cm_phone}
                onChange={handleChange('cm_phone')}
                maxLength={10}
                disabled={disabled}
            />

            <FileUpload 
                current={current}
                handleChange={handleChange}
                disabled={disabled}
            />
        </div>
    );
};

const AuthorizationServicesTabs = ({ services, disabled, handleChange }) => {
    const { t } = useTranslation();

    const serviceLabels = [
        { key: 'sdc', label: t('member.authorizations.sdc') },
        { key: 'transportation', label: t('member.authorizations.transportation') }
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

    const tabContent = {
        sdc: (
            <div>
                <div className="member-detail">
                    <label>{t('member.authorizations.auth_id')}</label>
                    <input
                        type="text"
                        value={services?.[0]?.auth_id || ''}
                        onChange={handleServiceChange(0, 'auth_id')}
                        disabled={disabled}
                    />
                </div>
                <div className="member-detail">
                    <label>{t('member.authorizations.service_code')}</label>
                    <input
                        type="text"
                        value={services?.[0]?.service_code || ''}
                        onChange={handleServiceChange(0, 'service_code')}
                        disabled={disabled}
                    />
                </div>
                <div className="member-detail">
                    <label>{t('member.authorizations.service_units')}</label>
                    <input
                        type="number"
                        value={services?.[0]?.service_units || ''}
                        onChange={handleServiceChange(0, 'service_units')}
                        disabled={disabled}
                    />
                </div>
            </div>
        ),
        transportation: (
            <div>
                <div className="member-detail">
                    <label>{t('member.authorizations.auth_id')}</label>
                    <input
                        type="text"
                        value={services?.[1]?.auth_id || ''}
                        onChange={handleServiceChange(1, 'auth_id')}
                        disabled={disabled}
                    />
                </div>
                <div className="member-detail">
                    <label>{t('member.authorizations.service_code')}</label>
                    <input
                        type="text"
                        value={services?.[1]?.service_code || ''}
                        onChange={handleServiceChange(1, 'service_code')}
                        disabled={disabled}
                    />
                </div>
                <div className="member-detail">
                    <label>{t('member.authorizations.service_units')}</label>
                    <input
                        type="number"
                        value={services?.[1]?.service_units || ''}
                        onChange={handleServiceChange(1, 'service_units')}
                        disabled={disabled}
                    />
                </div>
            </div>
        )
    };

    return (
        <ListDetail
            tabs={serviceLabels}
            tabContent={tabContent}
            disabled={disabled}
        />
    );
};

export default MemberAuthModal;