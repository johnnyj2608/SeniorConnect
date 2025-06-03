import React from 'react';
import { useTranslation } from 'react-i18next';

const absenceTypes = [
    'vacation', 
    'hospital', 
    'personal', 
    'other'
];

const MemberAbsencesModal = ({ data, handleChange, activeTab }) => {
    const { t } = useTranslation();
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('member.absences.label')}</h3>
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
                <label>{t('member.authorization.start_date')} *</label>
                <input
                    type="date"
                    value={disabled ? '' : current.start_date || ''}
                    onChange={handleChange('start_date')}
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                <label>{t('member.authorization.end_date')}</label>
                <input
                    type="date"
                    value={disabled ? '' : current.end_date || ''}
                    onChange={handleChange('end_date')}
                    disabled={disabled}
                />
            </div>

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