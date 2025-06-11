import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const absenceTypes = [
    'vacation', 
    'hospital', 
    'personal', 
    'assessment',
    'other'
];

const MemberAbsencesModal = ({ data, handleChange, activeTab }) => {
    const { t } = useTranslation();
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    const isAssessment = current.absence_type === 'assessment';
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUserOptions = async () => {
            try {
                const response = await fetchWithRefresh('/user/users/');
                if (!response.ok) return;

                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error(error);
            }
        };

        getUserOptions();
    }, []);

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('member.absences.label')}</h3>
                {!isAssessment && (
                <label>
                    <input
                    type="checkbox"
                    checked={disabled ? false : current.called === true}
                    onChange={(e) =>
                        handleChange('called')({ target: { value: e.target.checked } })
                    }
                    disabled={disabled}
                    />
                    {t('member.absences.called')}
                </label>
                )}
            </div>

            <div className="member-detail">
                <label>{t('member.absences.label')} *</label>
                <select
                    required
                    value={disabled ? '' : current.absence_type || ''}
                    onChange={handleChange('absence_type')}
                    disabled={disabled}
                >
                    <option value="">{t('general.select_an_option')}</option>
                    {absenceTypes.map((type) => (
                        <option key={type} value={type}>
                            {t(`member.absences.${type}`)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="member-detail">
                <label>
                    {isAssessment
                        ? `${t('member.absences.date')} *`
                        : `${t('member.absences.start_date')} *`}
                </label>
                <input
                type="date"
                value={disabled ? '' : current.start_date || ''}
                onChange={handleChange('start_date')}
                disabled={disabled}
                />
            </div>

            {!isAssessment && (
                <div className="member-detail">
                <label>{t('member.absences.end_date')}</label>
                <input
                    type="date"
                    value={disabled ? '' : current.end_date || ''}
                    onChange={handleChange('end_date')}
                    disabled={disabled}
                />
                </div>
            )}

            {isAssessment && (
                <>
                <div className="member-detail">
                    <label>{t('member.absences.time')} *</label>
                    <input
                    type="time"
                    value={disabled ? '' : current.time || ''}
                    onChange={handleChange('time')}
                    disabled={disabled}
                    />
                </div>

                <div className="member-detail">
                    <label>{t('member.absences.user')} *</label>
                    <select
                        required
                        value={disabled ? '' : current.user || ''}
                        onChange={handleChange('user')}
                        disabled={disabled}
                    >
                        <option value="">{t('general.select_an_option')}</option>
                        {users.map((option) => (
                            <option key={option.name} value={option.name}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                </>
            )}

            <div className="member-detail">
                <label>{t('general.note')}</label>
                <input
                    type="text"
                    value={disabled ? '' : current.note || ''}
                    onChange={handleChange('note')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>
        </>
    );
};
    
export default MemberAbsencesModal;