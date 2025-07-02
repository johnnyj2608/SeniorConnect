import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { MltcContext } from '../../context/MltcContext';
import { UserContext } from '../../context/UserContext';
import SettingsItem from '../items/SettingsItem';

const SettingsAdmin = ({ onEdit }) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { mltcs, refreshMltc } = useContext(MltcContext);
  const { users, refreshUser } = useContext(UserContext);

  const handleEdit = async (type) => {
    if (type === 'mltcs') {
      await refreshMltc();
      onEdit(type, mltcs);
    } else if (type === 'users') {
      await refreshUser();
      onEdit(type, users);
    } else if (type === 'sadcs') {
      onEdit(type, null);
    }
  };

  if (!user?.is_org_admin) return null;

  return (
    <div id="settings-admin">
      <h3 className="section-title">{t('settings.admin.label')}</h3>
      <div className="section-main">
        <SettingsItem
          label={t('settings.admin.sadc.label')}
          onClick={() => handleEdit('sadcs')}
        />
        <SettingsItem
          label={t('settings.admin.mltc.label')}
          onClick={() => handleEdit('mltcs')}
        />
        <SettingsItem
          label={t('settings.admin.users.label')}
          onClick={() => handleEdit('users')}
        />
      </div>
    </div>
  );
};

export default SettingsAdmin;