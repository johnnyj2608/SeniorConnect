import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AbsenceItem from '../items/AbsenceItem';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const HomeAbsenceCard = () => {
  const { t } = useTranslation();
  const [leaving, setLeaving] = useState([]);
  const [returning, setReturning] = useState([]);

  useEffect(() => {
    const getAbsences = async () => {
      try {
        const response = await fetchWithRefresh('/core/absences/upcoming/');
        if (!response.ok) return;

        const data = await response.json();
        setLeaving(data.leaving);
        setReturning(data.returning);
      } catch (error) {
        console.log(error);
      }
    };

    getAbsences();
  }, []);

  return (
    <div className="card-full">
      <h2>{t('snapshots.absences')}</h2>
      <div className="card-container">
        <div className="absence-container">
          <div className="absence-list">
            <h3>{t('home.leaving_soon')}</h3>
            <ul>
              {leaving.map(absence => (
                <AbsenceItem key={absence.member} absence={absence} />
              ))}
            </ul>
          </div>
          <div className="absence-list">
            <h3>{t('home.returning_soon')}</h3>
            <ul>
              {returning.map(absence => (
                <AbsenceItem key={absence.member} absence={absence} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAbsenceCard;