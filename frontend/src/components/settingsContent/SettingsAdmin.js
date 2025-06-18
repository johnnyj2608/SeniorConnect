import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import SettingsItem from '../items/SettingsItem';

const SettingsAdmin = ({ onEdit }) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const handleEdit = async (url, type) => {
    try {
      const response = await fetchWithRefresh(url);
      if (!response.ok) throw new Error();

      const data = await response.json();
      onEdit(type, data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user?.is_org_admin) return null;

  return (
    <div id="settings-admin">
      <h3 className="section-title">{t('settings.admin.label')}</h3>
      <div className="section-main">
        <SettingsItem
          label={t('model.mltc')}
          onClick={() => handleEdit('/core/mltcs/', 'mltcs')}
        />
        <SettingsItem
          label={t('settings.general.language')}
          onClick={() => handleEdit('/core/languages/', 'languages')}
        />
        <SettingsItem
          label={t('settings.admin.users.label')}
          onClick={() => handleEdit('/user/users/', 'users')}
        />
        <SettingsItem
          label={t('settings.general.upload')}
          onClick={() => console.log('Upload')}
        />
      </div>
    </div>
  );
};

export default SettingsAdmin;