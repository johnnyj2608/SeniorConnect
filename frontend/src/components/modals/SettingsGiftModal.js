import React from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from '../inputs/TextInput';
import { formatTimestamp } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const SettingsGiftModal = ({ type, data, handleChange, activeTab, mltcs, handleLimit }) => {
    const { t } = useTranslation();

    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0 || type === 'gifteds';
    const limitIndex = current.id === 'new' ? data.length - 1 - activeTab : activeTab;

    const fetchGiftedData = async (status = 'received') => {
        try {
            const response = await fetchWithRefresh(`/core/gifteds/${status}/${current.id}/`);
            if (!response.ok) return;
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    };

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
                value={current.name}
                onChange={handleChange('name')}
                onLimitExceeded={handleLimit('name', limitIndex)}
                required
                showDisabled={type === 'gifteds'}
                disabled={disabled}
            />

            {type !== 'gifteds' && (
                <>
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

                    <TextInput
                        type="date"
                        label={t('settings.admin.gifts.expires_at')}
                        value={current.expires_at}
                        onChange={handleChange('expires_at')}
                        disabled={disabled}
                    />

                    {current.expires_at && (
                        <div className="member-detail right">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={!!current.expires_delete}
                                    onChange={(e) =>
                                        handleChange('expires_delete')({ target: { value: e.target.checked } })
                                    }
                                    disabled={disabled}
                                />
                                {t('settings.admin.gifts.expires_delete')}
                            </label>
                        </div>
                    )}

                    <div className="switch-container">
                        <button 
                            className="action-button thin"
                            onClick={() => fetchGiftedData('received')}>
                                {t('settings.admin.gifts.received_list')}
                        </button>
                        <button 
                            className="action-button thin"
                            onClick={() => fetchGiftedData('unreceived')}>
                                {t('settings.admin.gifts.unreceived_list')}
                        </button>
                    </div>
                </>
            )}

            {type === 'gifteds' && (
                <>
                    <TextInput
                        label={t('settings.admin.gifts.received')}
                        value={formatTimestamp(current.created_at)}
                        onChange={handleChange('created_at')}
                        onLimitExceeded={handleLimit('created_at')}
                        showDisabled={true}
                        disabled={true}
                    />
                    <TextInput
                        label={t('general.note')}
                        value={current.note}
                        onChange={handleChange('note')}
                        onLimitExceeded={handleLimit('note')}
                        maxLength={220}
                    />
                </>
            )}
        </>
    );
};

export default SettingsGiftModal;