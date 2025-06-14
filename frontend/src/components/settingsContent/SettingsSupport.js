import React from 'react';
import { useTranslation } from 'react-i18next';
import SettingsItem from '../items/SettingsItem';

const SettingsSupport = () => {
  const { t } = useTranslation();

  return (
    <div id="settings-support">
      <h3 className="section-title">{t('settings.support.label')}</h3>
      <div className="section-main">
        <SettingsItem label={t('settings.support.terms_of_service')} onClick={() => console.log('Terms of Service')} />
        <SettingsItem label={t('settings.support.privacy_policy')} onClick={() => console.log('Privacy Policy')} />
        <SettingsItem label={t('settings.support.help_center')} onClick={() => console.log('Help Center')} />
      </div>
    </div>
  );
};

export default SettingsSupport;