import React from 'react';
import { useTranslation } from 'react-i18next';
import CheckboxInput from '../inputs/CheckboxInput';
import ListDetail from '../layout/ListDetail';

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

      <div className="member-detail">
        <label>{t('snapshots.label')}</label>
        <div className="member-detail-checkbox">
          <label>
            <input
              type="checkbox"
              checked={disabled ? false : current.view_snapshots === true}
              onChange={(e) => handleChange('view_snapshots')({ target: { value: e.target.checked } })}
              disabled={disabled || adminUser}
            />
            <span>
              {current.view_snapshots
                ? t('settings.admin.users.can_view_snapshots')
                : t('settings.admin.users.cant_view_snapshots')
              }
            </span>
          </label>
        </div>
      </div>

      <ListDetail
        label={t('settings.admin.mltc.label')}
        value={
          <CheckboxInput
            options={mltcOptions}
            selectedValues={current.allowed_mltcs || []}
            onChange={handleMltcChange}
            disabled={disabled}
            isAdmin={adminUser}
          />
        }
      />
    </>
  );
};

export default SettingsUserModal;