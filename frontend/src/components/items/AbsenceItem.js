import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const AbsenceItem = ({ absence }) => {
  const renderDaysUntil = (days) => {
    if (days === 0) return 'Today';
    if (days === 1) return '1 Day';
    return `${days} Days`;
  };

  return (
    <li>
      <Link to={`/member/${absence.member}`} className="home-item">
        <span className="home-item-title">
          <p className="home-item-primary">{absence.member_name}</p>
          <p className="home-item-sub"> — {absence.absence_type}</p>
        </span>
        <span className="home-item-detail nowrap">{renderDaysUntil(absence.days_until)}</span>
      </Link>
    </li>
  );
};

export default memo(AbsenceItem);
