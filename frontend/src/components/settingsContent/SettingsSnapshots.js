import React from 'react';
import { useTranslation } from 'react-i18next';
import SettingsItem from '../items/SettingsItem';

const SettingsSnapshots = () => {
  const { t } = useTranslation();

  return (
    <>
      <h3 className="section-title">{t('snapshots.label')}</h3>
      <div className="section-main">
        <SettingsItem label={t('snapshots.members')} onClick={() => console.log('Members')} />
        <SettingsItem label={t('snapshots.birthdays')} onClick={() => console.log('Birthdays')} />
        <SettingsItem label={t('snapshots.absences')} onClick={() => console.log('Absences')} />
        <SettingsItem label={t('snapshots.enrollment')} onClick={() => console.log('Enrollment')} />
        {/* Dropdown to show year, then month */}
      </div>
    </>
  );
};

export default SettingsSnapshots;