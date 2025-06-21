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

  const exportMemberCSV = async () => {
    try {
      const response = await fetchWithRefresh('/core/members/csv/');
      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;

      const todayStr = new Date()
        .toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })
        .replace(/\//g, '_');
      const filename = `member_data_${todayStr}.csv`;
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div id="settings-data">
      <h3 className="section-title">{t('settings.data.label')}</h3>
      <div className="section-main">
        <SettingsItem label={t('settings.data.download_members')} onClick={exportMemberCSV} />
        <SettingsItem label={t('settings.data.upload_members')} onClick={() => onEdit('import', {name: '', date: '', file: ''})} />
        <SettingsItem label={t('settings.data.restore_deleted')} onClick={handleDeletedModal} />
      </div>
    </div>
  );
};

export default SettingsData;