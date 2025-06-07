import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { sortSchedule } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const daysOfWeek = [
    'monday',
    'thursday',
    'tuesday',
    'friday',
    'wednesday',
    'saturday',
    'sunday'
];

const MemberAuthModal = ({ data, handleChange, activeTab, handleActiveToggle }) => {
    const { t } = useTranslation();
    const [mltcOptions, setMltcOptions] = useState([]);
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    useEffect(() => {
        const getMltcOptions = async () => {
            try {
                const response = await fetchWithRefresh('/core/mltcs/');
                if (!response.ok) return;

                const data = await response.json();
                setMltcOptions(data);
            } catch (error) {
                console.error(error);
            }
        };

        getMltcOptions();
    }, []);

    const selectedMltc = mltcOptions.find(mltc => mltc.name === current.mltc);
    const dx_codes = selectedMltc?.dx_codes || [];

    const handleScheduleChange = (day) => (event) => {
        const { checked } = event.target;
        const currentSchedule = current.schedule || [];

        const newSchedule = checked
            ? [...currentSchedule, day]
            : currentSchedule.filter(d => d !== day);
        const sortedSchedule = sortSchedule(newSchedule);

        handleChange('schedule')({ target: { value: sortedSchedule } });
    };

    return (
        <>
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
                        handleChange('mltc')(e);
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

            <div className="member-detail">
                <label>{t('member.authorizations.mltc_member_id')} *</label>
                <input
                    type="text"
                    value={disabled ? '' : current.mltc_member_id || ''}
                    onChange={handleChange('mltc_member_id')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                <label>{t('member.authorizations.start_date')} *</label>
                <input
                    type="date"
                    value={disabled ? '' : current.start_date || ''}
                    onChange={handleChange('start_date')}
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                <label>{t('member.authorizations.end_date')} *</label>
                <input
                    type="date"
                    value={disabled ? '' : current.end_date || ''}
                    onChange={handleChange('end_date')}
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                <label>{t('member.authorizations.dx_code')}</label>
                <select
                    required
                    value={!disabled && dx_codes?.includes(current.dx_code) ? current.dx_code : 0 || ''}
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

            <div className="member-box">
                <div className="member-box-label">
                    {t('member.authorizations.schedule')}
                </div>
                <div className="member-box-list">
                    <div className="schedule-container">
                        {daysOfWeek.map((day) => (
                            <label key={day}>
                                <input
                                    type="checkbox"
                                    value={day}
                                    checked={disabled ? false : current.schedule?.includes(day) || false}
                                    onChange={handleScheduleChange(day)}
                                    disabled={disabled}
                                />
                                {t(`general.days_of_week.${day}`)}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <AuthorizationServicesTabs
                services={current.services}
                disabled={disabled}
                handleChange={handleChange}
            />

            <div className="member-detail">
                <label>{t('member.authorizations.care_manager')}</label>
                <input
                    type="text"
                    value={disabled ? '' : current.cm_name || ''}
                    onChange={handleChange('cm_name')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                <label>↪ {t('member.authorizations.phone')}</label>
                <input
                    type="number"
                    value={disabled ? '' : current.cm_phone || ''}
                    onChange={handleChange('cm_phone')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>
        </>
    );
};

const AuthorizationServicesTabs = ({ services, disabled, handleChange }) => {
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState('SDC');

    const serviceLabels = ['SDC', 'Transport'];

    const handleServiceChange = (index, field) => (event) => {
        const updatedService = {
            ...(services?.[index] || {}),
            [field]: event.target.value,
        };

        const updatedServices = [...(services || [])];
        updatedServices[index] = updatedService;

        handleChange('services')({ target: { value: updatedServices } });
    };

    return (
        <div className="member-box">
            <div className="member-box-label">
                {serviceLabels.map((label) => (
                <button
                    key={label}
                    type="button"
                    onClick={() => setActiveTab(label)}
                    className={`member-box-tab ${activeTab === label ? 'active' : ''}`}
                    disabled={disabled}
                >
                    {label}
                </button>
                ))}
            </div>

            <div className="member-box-list">
                {serviceLabels.map((label, index) =>
                    activeTab === label ? (
                        <div key={label}>
                            <div className="member-detail">
                                <label>{t('member.authorizations.auth_id')}</label>
                                <input
                                    type="text"
                                    value={services?.[index]?.auth_id || ''}
                                    onChange={handleServiceChange(index, 'auth_id')}
                                    disabled={disabled}
                                />
                            </div>

                            <div className="member-detail">
                                <label>{t('member.authorizations.service_code')}</label>
                                <input
                                    type="text"
                                    value={services?.[index]?.service_code || ''}
                                    onChange={handleServiceChange(index, 'service_code')}
                                    disabled={disabled}
                                />
                            </div>

                            <div className="member-detail">
                                <label>{t('member.authorizations.service_units')}</label>
                                <input
                                    type="number"
                                    value={services?.[index]?.service_units || ''}
                                    onChange={handleServiceChange(index, 'service_units')}
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                    ) : null
                )}
            </div>
        </div>
    );
};

export default MemberAuthModal;