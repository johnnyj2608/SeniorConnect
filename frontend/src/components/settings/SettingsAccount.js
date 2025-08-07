import React, { useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import SettingsItem from '../items/SettingsItem';

const SettingsAccount = () => {
  const { t } = useTranslation();
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      const response = await fetchWithRefresh('/user/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error(t('errors.unknown_type'));

      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  }, [setUser, navigate, t]);

  const handleResetPassword = () => {
    alert(t('settings.account.password_reset_instructions'));
  };

  return (
    <div id="settings-account">
      <h3 className="section-title">{t('settings.account.label')}</h3>
      <div className="settings-main">
        <SettingsItem label={t('settings.account.reset_password')} onClick={handleResetPassword} />
        <SettingsItem label={t('settings.account.log_out')} onClick={handleLogout} />
      </div>
    </div>
  );
};

export default SettingsAccount;
