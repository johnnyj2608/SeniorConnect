import React, { useState, useEffect } from 'react';
import AbsenceItem from '../items/AbsenceItem';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const HomeAbsenceCard = () => {
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
        console.log('Failed to fetch absences:', error);
      }
    };

    getAbsences();
  }, []);

  return (
    <div className="full-card">
      <h2>Absences</h2>
      <div className="card-container">
        <div className="absence-container">
          <div className="absence-list">
            <h3>Leaving Soon</h3>
            <ul>
              {leaving.map(absence => (
                <AbsenceItem key={absence.member} absence={absence} />
              ))}
            </ul>
          </div>
          <div className="absence-list">
            <h3>Returning Soon</h3>
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