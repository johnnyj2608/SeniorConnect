import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsItem from '../items/SettingsItem';
import { AuthContext } from '../../context/AuthContext';

const SettingsSnapshots = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  if (!user?.is_org_admin || !user?.view_snapshots) return null;

  return (
    <div id="settings-snapshots">
      <h3 className="section-title">{t('snapshots.label')}</h3>
      <div className="section-main">
        <SettingsItem label={t('snapshots.members')} onClick={() => console.log('Members')} />
        <SettingsItem label={t('snapshots.birthdays')} onClick={() => console.log('Birthdays')} />
        <SettingsItem label={t('snapshots.absences')} onClick={() => console.log('Absences')} />
        <SettingsItem label={t('snapshots.enrollments')} onClick={() => console.log('Enrollment')} />
        {/* Dropdown to show year, then month */}
      </div>
    </div>
  );
};

export default SettingsSnapshots;