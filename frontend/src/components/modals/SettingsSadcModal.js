import React from 'react';
import { useTranslation } from 'react-i18next';
import ListInput from '../inputs/ListInput';
import ListDetail from '../layout/ListDetail';

const attendanceTemplateOptions = [
    { value: 1 },
    // { value: 2 },
];

const SettingsSadcModal = ({ data, handleChange }) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('settings.admin.sadc.label')}</h3>
            </div>

            <div className="member-detail">
                <label>{t('settings.admin.sadc.name')} *</label>
                <input
                    type="text"
                    value={data.name || ''}
                    onChange={handleChange('name')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('settings.admin.sadc.email')} *</label>
                <input
                    type="text"
                    value={data.email || ''}
                    onChange={handleChange('email')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('settings.admin.sadc.phone')} *</label>
                <input
                    type="number"
                    value={data.phone || ''}
                    onChange={handleChange('phone')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('settings.admin.sadc.address')} *</label>
                <input
                    type="text"
                    value={data.address || ''}
                    onChange={handleChange('address')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('settings.admin.sadc.npi')} *</label>
                <input
                    type="number"
                    value={data.npi || ''}
                    onChange={handleChange('npi')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('settings.admin.sadc.attendance')}</label>
                <select
                    value={data.attendance_template}
                    onChange={handleChange('attendance_template')}
                >
                {attendanceTemplateOptions.map(({ value }) => (
                    <option key={value} value={value}>
                    {t('settings.admin.sadc.template')} #{value}
                    </option>
                ))}
                </select>
            </div>

            <ListDetail
                label={t('settings.admin.sadc.languages')}
                value={
                    <ListInput
                    data={data.languages || []}
                    onChange={handleChange('languages')}
                />
                }
            />
        </>
    );
};

export default SettingsSadcModal;