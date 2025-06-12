import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import SettingsItem from '../items/SettingsItem';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import Switch from 'react-switch';

const SettingsGeneral = () => {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useContext(AuthContext);

  const updatePreference = async (key, value) => {
    const updatedPreferences = {
      ...user.preferences,
      [key]: value,
    };
  
    try {
      const response = await fetchWithRefresh(`/user/users/${user.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: updatedPreferences }),
      });
  
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem(key, JSON.stringify(value));
        
        if (key === 'language') {
          i18n.changeLanguage(value);
        }
      } else {
        console.error(await response.text());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const togglePreference = (key) => {
    const currentValue = user?.preferences?.[key];
    updatePreference(key, !currentValue);
  };
  
  const handleLanguageChange = (e) => {
    updatePreference('language', e.target.value);
  };

  return (
    <>
      <h3 className="section-title">{t('settings.general.label')}</h3>
      <div className="section-main">
        <SettingsItem label={t('settings.general.notification')} onClick={() => console.log('Notification')} />
        <SettingsItem 
          label={t('settings.general.dark_mode')} 
          component={
            <Switch
              checked={user.preferences?.dark_mode}
              onChange={() => togglePreference('dark_mode')}
              onColor="#6366F1"
            />
          } 
        />
        <SettingsItem 
          label={t('settings.general.alt_name')} 
          component={
            <Switch
              checked={user.preferences?.alt_name}
              onChange={() => togglePreference('alt_name')}
              onColor="#6366F1"
            />
          } 
        />
        <SettingsItem
          label={t('settings.general.language')}
          component={
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
            >
              <option value="en">{t('language.english')}</option>
              <option value="zh-CN">{t('language.chinese')}</option>
            </select>
          }
        />
        <SettingsItem label={t('settings.general.upload')} onClick={() => console.log('Upload')} />
      </div>
    </>
  );
};

export default SettingsGeneral;