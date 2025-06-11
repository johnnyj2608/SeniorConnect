import React from 'react';
import { useTranslation } from 'react-i18next';
import CheckboxInput from '../inputs/CheckboxInput';

const SettingsUserModal = ({ data, handleChange, activeTab, mltcOptions }) => {
  const { t } = useTranslation();

  const current = data[activeTab] || {};
  const disabled = data.filter(tab => !tab.deleted).length <= 0;
  const adminUser = current.is_org_admin;

  const handleMltcChange = (newSelected) => {
    handleChange('allowed_mltcs')({ target: { value: newSelected } });
  };

  return (
    <>
      <div className="modal-header">
        <h3>{t('general.edit')}{t('settings.data.users.label')}</h3>
        {!adminUser && (
          <label>
            <input
              type="checkbox"
              checked={disabled ? false : current.is_active === true}
              onChange={(e) => handleChange('is_active')({ target: { value: e.target.checked } })}
              disabled={disabled}
            />
            {t('status.active')}
          </label>
        )}
      </div>
      <div className="member-detail">
        <label>{t('settings.data.users.name')}</label>
        <input
          type="text"
          value={disabled ? '' : current.name || ''}
          onChange={handleChange('name')}
          autoComplete="off"
          disabled={disabled}
        />
      </div>
      <div className="member-detail">
        <label>{t('settings.data.users.email')}</label>
        <input
          type="email"
          value={disabled ? '' : current.email || ''}
          onChange={handleChange('email')}
          autoComplete="off"
          disabled={disabled || adminUser}
        />
      </div>

      <CheckboxInput
        label={t('settings.data.mltc.label')} 
        options={mltcOptions}
        selectedValues={current.allowed_mltcs || []}
        onChange={handleMltcChange}
        disabled={disabled || adminUser}
      />
    </>
  );
};

export default SettingsUserModal;