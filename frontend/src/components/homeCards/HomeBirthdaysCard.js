import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomeBirthdayCard = () => {
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    const getBirthdays = async () => {
        const response = await fetch(`/core/members/?filter=home`)
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
            <Link to={`/member/${birthday.id}`}>
              <li key={birthday.id} className="birthday-item">
                <span>{birthday.first_name} {birthday.last_name} </span>
                <span>{renderBirthdayMessage(birthday.days_until)}</span>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default HomeBirthdayCard
