import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const BirthdayItem = ({ birthday }) => {
  const renderBirthdayMessage = (daysUntil) => {
    if (daysUntil === 0) return "🎂";
    if (daysUntil === 1) return "1 Day";
    return `${daysUntil} Days`;
  };

  return (
    <li>
      <Link to={`/member/${birthday.id}`} className="home-item">
        <span>{birthday.last_name}, {birthday.first_name}</span>
        <span>{renderBirthdayMessage(birthday.days_until)}</span>
      </Link>
    </li>
  );
};

export default memo(BirthdayItem);
