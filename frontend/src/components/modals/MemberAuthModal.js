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
                console.error('Failed to fetch MLTC options:', error);
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
                <label>{t('member.authorizations.mltc_auth_id')} *</label>
                <input
                    type="text"
                    value={disabled ? '' : current.mltc_auth_id || ''}
                    onChange={handleChange('mltc_auth_id')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                <label>{t('member.authorizations.schedule')}</label>
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

            <div className="member-detail">
                <label>{t('member.authorizations.sdc_code')}</label>
                <input
                    type="text"
                    value={disabled ? '' : current.sdc_code || ''}
                    onChange={handleChange('sdc_code')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                <label>{t('member.authorizations.trans_code')}</label>
                <input
                    type="text"
                    value={disabled ? '' : current.trans_code || ''}
                    onChange={handleChange('trans_code')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>
        </>
    );
};

export default MemberAuthModal;