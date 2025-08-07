import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SettingsItem from '../items/SettingsItem';

const SettingsSupport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div id="settings-support">
      <h3 className="section-title">{t('settings.support.label')}</h3>
      <div className="section-main">
        <SettingsItem
          label={t('settings.support.terms')}
          onClick={() => handleNavigate('/support/terms')}
        />
        <SettingsItem
          label={t('settings.support.privacy')}
          onClick={() => handleNavigate('/support/privacy')}
        />
        <SettingsItem
          label={t('settings.support.help')}
          onClick={() => handleNavigate('/support/help')}
        />
      </div>
    </div>
  );
};

export default SettingsSupport;