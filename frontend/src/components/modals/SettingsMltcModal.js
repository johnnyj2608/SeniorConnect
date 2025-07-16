import React from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from '../inputs/TextInput';
import ListInput from '../inputs/ListInput';
import ListDetail from '../layout/ListDetail';

const SettingsMltcModal = ({ data, handleChange, activeTab, handleLimit }) => {
    const { t } = useTranslation();

    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;
    const limitIndex = current.id === 'new' ? data.length - 1 - activeTab : activeTab;

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('settings.admin.mltcs.label')}</h3>
                <label>
                    <input
                        type="checkbox"
                        checked={disabled ? false : current.active === true}
                        onChange={(e) => handleChange('active')({ target: { value: e.target.checked } })}
                        disabled={disabled}
                    />
                    {t('status.active')}
                </label>
            </div>

            <TextInput
                label={t('settings.admin.mltcs.name')}
                value={current.name}
                onChange={handleChange('name')}
                onLimitExceeded={handleLimit('name', limitIndex)}
                disabled={disabled}
            />

            <ListDetail
                label={t('settings.admin.mltcs.dx_codes')}
                value={
                    <ListInput
                    data={current.dx_codes || []}
                    onChange={handleChange('dx_codes')}
                    disabled={disabled}
                />
                }
            />
        </>
    );
};

export default SettingsMltcModal;