import React from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from '../inputs/TextInput';
import CheckboxInput from '../inputs/CheckboxInput';
import ListDetail from '../layout/ListDetail';

const SettingsUserModal = ({ data, handleChange, activeTab, mltcs, handleLimit }) => {
  const { t } = useTranslation();

  const current = data[activeTab] || {};
  const disabled = data.filter(tab => !tab.deleted).length <= 0;
  const adminUser = current.is_org_admin;
  const limitIndex = current.id === 'new' ? data.length - 1 - activeTab : activeTab;

  const handleMltcChange = (newSelected) => {
    handleChange('allowed_mltcs')({ target: { value: newSelected } });
  };

  const handleResetPassword = async () => {
    alert(t('settings.account.password_reset_instructions'));
    try {
      const response = await fetch('/user/auth/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: current.email }),
      });

      await response.json();
    } catch (err) {
      console.error(err);
    }
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

      <TextInput
        label={t('settings.admin.users.name')}
        value={current.name}
        onChange={handleChange('name')}
        onLimitExceeded={handleLimit('name', limitIndex)}
        required
        disabled={disabled}
      />

      <TextInput
        label={t('settings.admin.users.email')}
        type="email"
        value={current.email}
        onChange={handleChange('email')}
        onLimitExceeded={handleLimit('email', limitIndex)}
        maxLength={220}
        required
        disabled={disabled || adminUser}
        showDisabled={true}
      />

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
        label={t('settings.admin.mltcs.label')}
        value={
          <CheckboxInput
            options={mltcs}
            selectedValues={current.allowed_mltcs || []}
            onChange={handleMltcChange}
            disabled={disabled}
            isAdmin={adminUser}
          />
        }
      />

      <div className="switch-container">
        <p 
          className="modal-text-button"
          onClick={handleResetPassword}
        >
          {t('settings.admin.users.password_reset')}
        </p>
      </div>
    </>
  );
};

export default SettingsUserModal;