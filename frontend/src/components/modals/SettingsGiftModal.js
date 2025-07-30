import React from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from '../inputs/TextInput';

const SettingsGiftModal = ({ type, data, handleChange, activeTab, mltcs, handleLimit }) => {
    const { t } = useTranslation();

    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0 || type === 'gifteds';
    const limitIndex = current.id === 'new' ? data.length - 1 - activeTab : activeTab;

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('settings.admin.gifts.label')}</h3>
                {type === 'gifteds' && (
                <label>
                    <input
                        type="checkbox"
                        checked={!!current.received}
                        onChange={(e) =>
                            handleChange('received')({ target: { value: e.target.checked } })
                        }
                    />
                    {t('settings.admin.gifts.received')}
                </label>
                )}
            </div>

            <TextInput
                label={t('settings.admin.gifts.name')}
                value={current.gift_name || current.name}
                onChange={handleChange('gift_name')}
                onLimitExceeded={handleLimit('gift_name', limitIndex)}
                required
                showDisabled={type === 'gifteds'}
                disabled={disabled}
            />

            {type !== 'gifteds' && (
                <>
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
                            value={(disabled && type === 'gifts') ? '' : current.mltc || ''}
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

                    <div className="member-detail">
                        <label>{t('settings.admin.gifts.birth_month')}</label>
                        <select
                            value={current.birth_month || ''}
                            onChange={handleChange('birth_month')}
                            disabled={disabled}
                            required
                        >
                            <option value="">{t('settings.admin.gifts.all_months')}</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {t('general.month.' + (i + 1))}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            )}

            {type === 'gifteds' && (
                <TextInput
                    label={t('general.note')}
                    value={current.note}
                    onChange={handleChange('note')}
                    onLimitExceeded={handleLimit('note')}
                    maxLength={220}
                />
            )}
        </>
    );
};

export default SettingsGiftModal;