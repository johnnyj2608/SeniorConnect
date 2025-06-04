import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPhoto } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const MemberInfoModal = ({ data, handleChange }) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('member.info.label')}</h3>
            </div>

            <div className="member-detail">
                <label>{t('member.info.sadc_member_id')} *</label>
                <input
                    type="number"
                    value={data.sadc_member_id || ''}
                    onChange={handleChange('sadc_member_id')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.last_name')} *</label>
                <input
                    type="text"
                    value={data.last_name || ''}
                    onChange={handleChange('last_name')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.first_name')} *</label>
                <input
                    type="text"
                    value={data.first_name || ''}
                    onChange={handleChange('first_name')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.alt_name')}</label>
                <input
                    type="text"
                    value={data.alt_name || ''}
                    onChange={handleChange('alt_name')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.phone')}</label>
                <input
                    type="number"
                    value={data.phone || ''}
                    onChange={handleChange('phone')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.address')}</label>
                <input
                    type="text"
                    value={data.address || ''}
                    onChange={handleChange('address')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.email')}</label>
                <input
                    type="text"
                    value={data.email || ''}
                    onChange={handleChange('email')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.medicaid')}</label>
                <input
                    type="text"
                    value={data.medicaid?.toUpperCase() || ''}
                    onChange={handleChange('medicaid')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.ssn')}</label>
                <input
                    type="number"
                    value={data.ssn || ''}
                    onChange={handleChange('ssn')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.enrollment')}</label>
                <input
                    type="date"
                    value={data.enrollment_date || ''}
                    onChange={handleChange('enrollment_date')}
                />
            </div>

            <div className="member-detail">
                <label>{t('general.note')}</label>
                <input
                    type="text"
                    value={data.note || ''}
                    onChange={handleChange('note')}
                    autoComplete="off"
                />
            </div>
        </>
    );
};

const MemberInfoSideModal = ({ data, handleChange }) => {
    const { t } = useTranslation();
    const [languageOptions, setLanguageOptions] = useState([]);

    useEffect(() => {
        const getLanguageOptions = async () => {
            try {
                const response = await fetchWithRefresh('/core/languages/');
                if (!response.ok) return;

                const data = await response.json();
                setLanguageOptions(data);
            } catch (error) {
                console.error('Failed to fetch language options:', error);
            }
        };

        getLanguageOptions();
    }, []);

    return (
        <>
            <div className="photo-container">
                <img
                    src={formatPhoto(data.photo)}
                    alt={data.first_name ? `${data.first_name} ${data.last_name}` : t('member.info.label')}
                    className="preview-photo"
                    onError={(e) => e.target.src = "/default-profile.jpg"}
                />
                <label htmlFor="image-upload" className="action-button thin">
                    {t('general.buttons.choose_photo')}
                </label>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleChange('photo')}
                    style={{ display: 'none' }}
                />
            </div>

            <div className="member-detail stack">
                <label>{t('member.info.birth_date')} *</label>
                <input
                    type="date"
                    value={data.birth_date || ''}
                    onChange={handleChange('birth_date')}
                />
            </div>

            <div className="member-detail stack">
                <label>{t('member.info.gender')} *</label>
                <div className="radio-group">
                    <label>{t('general.male')}</label>
                    <input
                        type="radio"
                        name="gender"
                        value="M"
                        checked={data.gender === 'M'}
                        onChange={handleChange('gender')}
                    />
                    <label>{t('general.female')}</label>
                    <input
                        type="radio"
                        name="gender"
                        value="F"
                        checked={data.gender === 'F'}
                        onChange={handleChange('gender')}
                    />
                </div>
            </div>

            <div className="member-detail stack">
                <label>{t('member.info.language')}</label>
                <select
                    required
                    value={data?.language || ''}
                    onChange={handleChange('language')}
                >
                    <option value="">{t('general.select_an_option')}</option>
                    {languageOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
};

export { MemberInfoModal, MemberInfoSideModal };