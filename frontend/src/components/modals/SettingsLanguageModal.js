import React from 'react';
import { useTranslation } from 'react-i18next';

const SettingsLanguageModal = ({ data, handleChange, activeTab }) => {
  const { t } = useTranslation();

  const current = data[activeTab] || {};
  const disabled = data.filter(tab => !tab.deleted).length <= 0;

  return (
    <>
      <div className="modal-header">
        <h3>{t('general.edit')}{t('settings.admin.language.label')}</h3>
      </div>
      <div className="member-detail">
        <label>{t('settings.admin.language.name')} *</label>
        <input
          type="text"
          value={disabled ? '' : current.name || ''}
          onChange={handleChange('name')}
          autoComplete="off"
          disabled={disabled}
        />
      </div>
    </>
  );
};

export default SettingsLanguageModal;