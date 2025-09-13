import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NameDisplay from '../layout/NameDisplay';

const AbsenceItem = ({ absence }) => {
  const { t } = useTranslation();

  const renderDaysUntil = (days) => {
    if (days === 0) return t('home.today');
    if (days === 1) return t('home.tomorrow');
    return t('home.days', { count: days });
  };

  return (
    <li>
      <Link to={`/members/${absence.member}`} className="home-item">
        <span className="home-item-primary">
          <p>
            <NameDisplay
              sadcId={absence.sadc_member_id}
              memberName={absence.member_name}
              altName={absence.alt_name}
            />
          </p>
          <p>— {t(`member.absences.${absence.absence_type}`)}</p>
        </span>
        <span className="home-item-secondary">
          <p className="nowrap">{renderDaysUntil(absence.days_until)}</p>
        </span>
      </Link>
    </li>
  );
};

export default memo(AbsenceItem);
