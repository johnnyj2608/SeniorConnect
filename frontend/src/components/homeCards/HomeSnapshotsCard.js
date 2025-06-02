import React from 'react';
import { useTranslation } from 'react-i18next';

const HomeSnapshotCard = () => {
  const { t } = useTranslation();

  const month = 'june';

  return (
    <div className="home-section">
      <h2>{t('snapshots.label')}</h2>
      <p>{t('snapshots.month_snapshot_ready', { month: t(`general.months.${month}`) })}</p>
      <ul>
        <li>{t('snapshots.members')}</li>
        <li>{t('snapshots.birthdays')}</li>
        <li>{t('snapshots.absences')}</li>
        <li>{t('snapshots.enrollment')}</li>
      </ul>
      <p>{t('snapshots.see_archived')}</p>
    </div>
  );
}

export default HomeSnapshotCard;
