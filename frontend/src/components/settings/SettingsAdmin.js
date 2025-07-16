import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { MltcContext } from '../../context/MltcContext';
import { GiftContext } from '../../context/GiftContext';
import { UserContext } from '../../context/UserContext';
import SettingsItem from '../items/SettingsItem';

const SettingsAdmin = ({ onEdit }) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { mltcs, refreshMltc } = useContext(MltcContext);
  const { gifts, refreshGift } = useContext(GiftContext);
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
    } else if (type === 'gifts') {
      await refreshGift();
      onEdit(type, gifts);
    }
  };

  return (
    <div id="settings-admin">
      <h3 className="section-title">{t('settings.admin.label')}</h3>
      <div className="section-main">
        <SettingsItem
          label={t('settings.admin.sadc.label')}
          onClick={() => handleEdit('sadcs')}
        />
        <SettingsItem
          label={t('settings.admin.mltcs.label')}
          onClick={() => handleEdit('mltcs')}
        />
        <SettingsItem
          label={t('settings.admin.gifts.label')}
          onClick={() => handleEdit('gifts')}
        />
        {user?.is_org_admin && (
          <SettingsItem
            label={t('settings.admin.users.label')}
            onClick={() => handleEdit('users')}
          />
        )}
      </div>
    </div>
  );
};

export default SettingsAdmin;