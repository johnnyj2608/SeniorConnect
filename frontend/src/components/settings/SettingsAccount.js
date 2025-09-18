import React, { useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import SettingsItem from '../layout/SettingsItem';

const SettingsAccount = () => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);
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

  const handleResetPassword = async () => {
    alert(t('settings.account.password_reset_instructions'));
    try {
      const response = await fetch('/user/auth/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });

      await response.json();
    } catch (err) {
      console.error(err);
    }
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
