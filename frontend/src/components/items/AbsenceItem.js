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
        <span>{absence.member_name}: {absence.absence_type}</span>
        <span className="nowrap">{renderDaysUntil(absence.days_until)}</span>
      </Link>
    </li>
  );
};

export default memo(AbsenceItem);
