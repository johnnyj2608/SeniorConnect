import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomeBirthdayCard = () => {
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    const getBirthdays = async () => {
        const response = await fetch(`/core/members/?filter=birthdays`)
        const data = await response.json();
        setBirthdays(data);
    };

    getBirthdays();
    
  }, []);

  const renderBirthdayMessage = (daysUntil) => {
    if (daysUntil === 0) {
      return "🎂";
    } else if (daysUntil === 1) {
      return "1 Day";
    } else {
      return `${daysUntil} Days`;
    }
  };

  return (
    <div className="half-card">
      <h3>Birthdays</h3>
      <div className="card-container">
        <ul>
          {birthdays.map((birthday) => (
          <Link to={`/member/${birthday.id}`} key={birthday.id}>
            <li className="birthday-item">
              <span>{birthday.last_name}, {birthday.first_name}</span>
              <span>{renderBirthdayMessage(birthday.days_until_birthday)}</span>
            </li>
          </Link>
        ))}
        </ul>
      </div>
    </div>
  );
}

export default HomeBirthdayCard
