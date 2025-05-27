import React, { useState, useEffect } from 'react';
import BirthdayItem from '../items/BirthdayItem';
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

  return (
    <div className="full-card">
      <h3>Birthdays</h3>
      <div className="card-container">
        {birthdays.length === 0 ? (
          <p>No upcoming birthdays.</p>
        ) : (
          <ul>
            {birthdays.map(birthday => (
              <BirthdayItem key={birthday.id} birthday={birthday} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomeBirthdayCard;