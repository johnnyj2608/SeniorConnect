import React from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from '../inputs/TextInput';
import ListInput from '../inputs/ListInput';
import ListDetail from '../layout/ListDetail';
import generateAttendance from '../../utils/generateAttendance';
import { ReactComponent as Eye } from '../../assets/eye-open.svg'

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

            <TextInput
                label={t('settings.admin.sadc.name')}
                value={data.name}
                onChange={handleChange('name')}
                required
                disabled
            />

            <TextInput
                label={t('settings.admin.sadc.email')}
                type="email"
                value={data.email}
                onChange={handleChange('email')}
                maxLength={220}
                required
                disabled
            />

            <TextInput
                label={t('settings.admin.sadc.phone')}
                type="number"
                value={data.phone}
                onChange={handleChange('phone')}
                required
                disabled
                maxLength={10}
            />

            <TextInput
                label={t('settings.admin.sadc.address')}
                value={data.address}
                onChange={handleChange('address')}
                maxLength={220}
                required
                disabled
            />

            <TextInput
                label={t('settings.admin.sadc.npi')}
                type="number"
                value={data.npi}
                onChange={handleChange('npi')}
                required
                disabled
            />

            <div className="member-detail">
                <label>{t('settings.admin.sadc.attendance')}</label>
                <div className="input-with-button">
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
                    <button onClick={() => {
                        generateAttendance(
                            {}, 
                            '', 
                            data.name, 
                            data.attendance_template, 
                            true
                        )}}
                        >
                        <Eye />
                    </button>
                </div>
                
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