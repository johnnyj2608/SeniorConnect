import React, { useState, useEffect } from 'react';

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
      return "'s is today! 🎉";
    } else if (daysUntil === 1) {
      return "'s is tomorrow";
    } else {
      return `'s is in ${daysUntil} days`;
    }
  };

  return (
    <div className="home-section">
      <h3>Birthdays</h3>
      <ul>
        {birthdays.map((birthday) => (
          <li key={birthday.sadc_member_id}>
            {birthday.sadc_member_id}. {birthday.first_name} {birthday.last_name} 
            {renderBirthdayMessage(birthday.days_until)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomeBirthdayCard
