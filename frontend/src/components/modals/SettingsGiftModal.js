import React from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from '../inputs/TextInput';

const SettingsGiftModal = ({ data, handleChange, activeTab, mltcs, handleLimit }) => {
    const { t } = useTranslation();

    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;
    const limitIndex = current.id === 'new' ? data.length - 1 - activeTab : activeTab;

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('settings.admin.gifts.label')}</h3>
            </div>

            <TextInput
                label={t('settings.admin.gifts.name')}
                value={current.name}
                onChange={handleChange('name')}
                onLimitExceeded={handleLimit('name', limitIndex)}
                required
                disabled={disabled}
            />

            <TextInput
                type="date"
                label={t('settings.admin.gifts.expires_at')}
                value={current.expires_at}
                onChange={handleChange('expires_at')}
                disabled={disabled}
            />

            <div className="member-detail">
                <label>{t('settings.admin.gifts.mltc')} </label>
                <select
                    required
                    value={disabled ? '' : current.mltc || ''}
                    onChange={handleChange('mltc')}
                    disabled={disabled}
                >
                    <option value="">{t('settings.admin.gifts.all_mltcs')}</option>
                    {mltcs.map((option) => (
                        <option key={option.name} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
};

export default SettingsGiftModal;