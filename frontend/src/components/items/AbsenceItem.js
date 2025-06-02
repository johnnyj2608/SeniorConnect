import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const AbsenceItem = ({ absence }) => {
  const { t } = useTranslation();

  const renderDaysUntil = (days) => {
    if (days === 0) return t('home.today');
    if (days === 1) return t('home.tomorrow');
    return t('home.days', { count: days });
  };

  return (
    <li>
      <Link to={`/member/${absence.member}`} className="home-item">
        <span className="home-item-title">
          <p className="home-item-primary">{absence.member_name}</p>
          <p className="home-item-sub">
            — {t(`member.absences.${absence.absence_type}`)}
          </p>
        </span>
        <span className="home-item-detail nowrap">{renderDaysUntil(absence.days_until)}</span>
      </Link>
    </li>
  );
};

export default memo(AbsenceItem);
