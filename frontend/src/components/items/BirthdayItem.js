import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NameDisplay from '../layout/NameDisplay';

const BirthdayItem = ({ birthday }) => {
  const { t } = useTranslation();

  const renderBirthdayMessage = (daysUntil) => {
    if (daysUntil === 0) return t('home.today') + '!';
    if (daysUntil === 1) return t('home.tomorrow');
    return t('home.days', { count: daysUntil });
  };

  return (
    <li>
      <Link to={`/member/${birthday.id}`} className="home-item">
        <span className="home-item-primary">
          <p>
            <NameDisplay
              sadcId={birthday.sadc_member_id}
              memberName={`${birthday.last_name}, ${birthday.first_name}`}
              altName={birthday.alt_name}
            />
          </p>
          <p>— {t('home.turning_years_old', { count: birthday.age_turning })}</p>
        </span>
        <span className="home-item-secondary">
          <p className="nowrap">{renderBirthdayMessage(birthday.days_until)}</p>
        </span>
      </Link>
    </li>
  );
};

export default memo(BirthdayItem);