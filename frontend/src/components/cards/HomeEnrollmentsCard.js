import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EnrollmentItem from '../items/EnrollmentItem';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const HomeEnrollmentsCard = () => {
  const { t } = useTranslation();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const getEnrollments = async () => {
      try {
        const response = await fetchWithRefresh('/audit/enrollments/recent/');
        if (!response.ok) return;

        const data = await response.json();
        setEnrollments(data);
      } catch (error) {
        console.log(error);
      }
    };

    getEnrollments();
  }, []);

  return (
    <div className="card-full">
      <h2>{t('snapshots.enrollments')}</h2>
      <div className="card-container">
        {enrollments.length === 0 ? (
          <p>{t('home.no_recent_enrollments')}</p>
        ) : (
            <ul>
                {enrollments.map(enrollment => (
                    <EnrollmentItem key={enrollment.id} enrollment={enrollment} />
                ))}
             </ul>
        )}
      </div>
    </div>
  );
};

export default HomeEnrollmentsCard;