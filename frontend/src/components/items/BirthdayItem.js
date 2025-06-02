import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
        <span className="home-item-title">
          <p className="home-item-primary">
            {birthday.sadc_member_id}. {birthday.last_name}, {birthday.first_name}
          </p>
          <p className="home-item-sub">
            — {t('home.turning_years_old', { count: birthday.age_turning })}
          </p>
        </span>
        <span className="home-item-detail">{renderBirthdayMessage(birthday.days_until)}</span>
      </Link>
    </li>
  );
};

export default memo(BirthdayItem);