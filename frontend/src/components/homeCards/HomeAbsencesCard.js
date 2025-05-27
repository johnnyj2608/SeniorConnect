import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  const renderDaysUntil = (days) => {
    if (days === 0) return 'Today';
    if (days === 1) return '1 Day';
    return `${days} Days`;
  };

  return (
    <div className="full-card">
      <h3>Absences</h3>
      <div className="card-container">
        <div className="absence-container">
          <div className="absence-list">
            <h3>Leaving Soon</h3>
            <ul>
              {leaving.map(absence => (
                <Link to={`/member/${absence.id}`} key={absence.id}>
                  <li className="home-item">
                    <span>{absence.member_name}: {absence.absence_type}</span>
                    <span className="nowrap">{renderDaysUntil(absence.days_until)}</span>
                  </li>
                </Link>
              ))}
            </ul>
         </div>
          <div className="absence-list">
            <h3>Returning Soon</h3>
            <ul>
              {returning.map(absence => (
                <Link to={`/member/${absence.id}`} key={absence.id}>
                  <li className="home-item">
                    <span>{absence.member_name}: {absence.absence_type}</span>
                    <span className="nowrap">{renderDaysUntil(absence.days_until)}</span>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeAbsenceCard
