import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from '../inputs/TextInput';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const absenceTypes = [
    'vacation', 
    'hospital', 
    'personal', 
    'assessment',
    'other'
];

const MemberAbsencesModal = ({ data, handleChange, activeTab, handleLimit }) => {
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
                <label>{t('member.absences.label')}</label>
                <select
                    value={disabled ? '' : current.absence_type || ''}
                    onChange={handleChange('absence_type')}
                    disabled={disabled}
                    required
                >
                    <option value="">{t('general.select_an_option')}</option>
                    {absenceTypes.map((type) => (
                        <option key={type} value={type}>
                            {t(`member.absences.${type}`)}
                        </option>
                    ))}
                </select>
            </div>

            <TextInput
                label={isAssessment ? t('member.absences.date') : t('member.absences.start_date')}
                type="date"
                value={current.start_date}
                onChange={handleChange('start_date')}
                disabled={disabled}
                required
            />

            {!isAssessment && (
                <TextInput
                    label={t('member.absences.end_date')}
                    type="date"
                    value={current.end_date}
                    onChange={handleChange('end_date')}
                    disabled={disabled}
                />
            )}

            {isAssessment && (
                <>
                    <TextInput
                        label={t('member.absences.time')}
                        type="time"
                        value={current.time}
                        onChange={handleChange('time')}
                        disabled={disabled}
                        required
                    />

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
                            <option key={option.name} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                </>
            )}

            <TextInput
                label={t('general.note')}
                value={current.note}
                onChange={handleChange('note')}
                onLimitExceeded={(exceeded) => handleLimit('note', activeTab)(exceeded)}
                disabled={disabled}
                maxLength={220}
            />
        </>
    );
};
    
export default MemberAbsencesModal;