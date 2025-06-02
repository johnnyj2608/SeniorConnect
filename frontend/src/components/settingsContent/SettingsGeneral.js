import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import SettingsItem from '../items/SettingsItem';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const SettingsGeneral = () => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);

  const toggleDarkMode = async () => {
    const updatedDarkMode = !user.preferences?.dark_mode;
    const updatedPreferences = {
      ...user.preferences,
      dark_mode: updatedDarkMode,
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
        localStorage.setItem('dark_mode', updatedDarkMode);
      } else {
        console.error(await response.text());
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <>
      <h3 className="section-title">{t('settings.general.label')}</h3>
      <div className="section-main">
        <SettingsItem label={t('settings.general.notification')} onClick={() => console.log('Notification')} />
        <SettingsItem label={t('settings.general.dark_mode')} onClick={toggleDarkMode} />
        <SettingsItem label={t('settings.general.language')} onClick={() => console.log('Language')} />
      </div>
    </>
  );
};

export default SettingsGeneral;