import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const BirthdayItem = ({ birthday }) => {
  const renderBirthdayMessage = (daysUntil) => {
    if (daysUntil === 0) return "Today!";
    if (daysUntil === 1) return "Tomorrow";
    return `${daysUntil} Days`;
  };

  return (
    <li>
      <Link to={`/member/${birthday.id}`} className="home-item">
        <span className="home-item-title">
          <p>
            {birthday.sadc_member_id}. {birthday.last_name}, {birthday.first_name}
          </p>
          <p>{' — Turning '}{birthday.age_turning}</p>
        </span>
        <span className="home-item-detail">{renderBirthdayMessage(birthday.days_until)}</span>
      </Link>
    </li>
  );
};

export default memo(BirthdayItem);