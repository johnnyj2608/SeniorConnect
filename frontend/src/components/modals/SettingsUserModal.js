import React from 'react';
import { useTranslation } from 'react-i18next';

const SettingsUserModal = ({ data, handleChange, activeTab }) => {
  const { t } = useTranslation();

  const current = data[activeTab] || {};
  const disabled = data.filter(tab => !tab.deleted).length <= 0;
  const adminUser = current.is_org_admin;

  return (
    <>
      <div className="modal-header">
        <h3>{t('general.edit')}{t('settings.admin.users.label')}</h3>
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
        <label>{t('settings.admin.users.name')} *</label>
        <input
          type="text"
          value={disabled ? '' : current.name || ''}
          onChange={handleChange('name')}
          autoComplete="off"
          disabled={disabled}
        />
      </div>
      <div className="member-detail">
        <label>{t('settings.admin.users.email')} *</label>
        <input
          type="email"
          value={disabled ? '' : current.email || ''}
          onChange={handleChange('email')}
          autoComplete="off"
          disabled={disabled || adminUser}
        />
      </div>
    </>
  );
};

export default SettingsUserModal;