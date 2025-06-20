import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import SettingsItem from '../items/SettingsItem';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import Switch from 'react-switch';

const languageOptions = [
    { value: 'en', labelKey: 'language.english' },
    { value: 'zh-CN', labelKey: 'language.chinese' },
];

const SettingsPreferences = () => {
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
    <div id="settings-preferences">
      <h3 className="section-title">{t('settings.preferences.label')}</h3>
      <div className="section-main">
        <SettingsItem label={t('settings.preferences.notification')} onClick={() => console.log('Notification')} />
        <SettingsItem 
          label={t('settings.preferences.dark_mode')} 
          component={
            <Switch
              checked={!!user?.preferences?.dark_mode}
              onChange={() => togglePreference('dark_mode')}
              onColor="#6366F1"
            />
          } 
        />
        <SettingsItem 
          label={t('settings.preferences.alt_name')} 
          component={
            <Switch
              checked={!!user?.preferences?.alt_name}
              onChange={() => togglePreference('alt_name')}
              onColor="#6366F1"
            />
          } 
        />
        <SettingsItem
          label={t('settings.preferences.language')}
          component={
            <select value={i18n.language} onChange={handleLanguageChange}>
                {languageOptions.map(({ value, labelKey }) => (
                    <option key={value} value={value}>
                        {t(labelKey)}
                    </option>
                ))}
            </select>
          }
        />
      </div>
    </div>
  );
};

export default SettingsPreferences;