import React from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from '../inputs/TextInput';
import ListInput from '../inputs/ListInput';
import ListDetail from '../layout/ListDetail';

const SettingsMltcModal = ({ data, handleChange, activeTab }) => {
    const { t } = useTranslation();
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('settings.admin.mltc.label')}</h3>
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
                label={t('settings.admin.mltc.name')}
                value={current.name}
                onChange={handleChange('name')}
                disabled={disabled}
            />

            <ListDetail
                label={t('settings.admin.mltc.dx_codes')}
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