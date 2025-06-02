import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BirthdayItem from '../items/BirthdayItem';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const HomeBirthdayCard = () => {
  const { t } = useTranslation();
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    const getBirthdays = async () => {
      try {
        const response = await fetchWithRefresh('/core/members/birthdays/');
        if (!response.ok) return;

        const data = await response.json();
        setBirthdays(data);
      } catch (error) {
        console.log(error);
      }
    };

    getBirthdays();
  }, []);

  return (
    <div className="full-card">
      <h2>{t('snapshots.birthdays')}</h2>
      <div className="card-container">
        {birthdays.length === 0 ? (
          <p>{t('home.no_upcoming_birthdays')}</p>
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