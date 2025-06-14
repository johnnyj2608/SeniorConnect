import React from 'react';
import { useTranslation } from 'react-i18next';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import SettingsItem from '../items/SettingsItem';

const SettingsData = ({ onEdit }) => {
  const { t } = useTranslation();

  const handleDeletedModal = async () => {
    try {
      const response = await fetchWithRefresh('/core/members/deleted/');
      if (!response.ok) throw new Error();

      const data = await response.json();
      onEdit('deleted', data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div id="settings-data">
      <h3 className="section-title">{t('settings.data.label')}</h3>
      <div className="section-main">
        <SettingsItem label={t('settings.data.download_template')} onClick={() => console.log('Template')} />
        <SettingsItem label={t('settings.data.download_members')} onClick={() => console.log('Members')} />
        <SettingsItem label={t('settings.data.restore_deleted')} onClick={handleDeletedModal} />
      </div>
    </div>
  );
};

export default SettingsData;