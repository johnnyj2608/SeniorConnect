import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const HomeBirthdayCard = () => {
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    const getBirthdays = async () => {
      try {
        const response = await fetchWithRefresh('/core/members/birthdays/');
        if (!response.ok) return;

        const data = await response.json();
        setBirthdays(data);
      } catch (error) {
        console.log('Failed to fetch birthdays:', error);
      }
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
    <div className="full-card">
      <h3>Birthdays</h3>
      <div className="card-container">
        <ul>
          {birthdays.length === 0 ? (
            <li className="home-item">No upcoming birthdays.</li>
          ) : (
            birthdays.map((birthday) => (
              <Link to={`/member/${birthday.id}`} key={birthday.id}>
                <li className="home-item">
                  <span>{birthday.last_name}, {birthday.first_name}</span>
                  <span>{renderBirthdayMessage(birthday.days_until)}</span>
                </li>
              </Link>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default HomeBirthdayCard
