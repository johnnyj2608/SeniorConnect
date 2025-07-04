import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import viewFile from '../../utils/viewFile';
import { useNavigate } from 'react-router-dom';

const HomeSnapshotCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    const getSnapshots = async () => {
      try {
        const response = await fetchWithRefresh('/tenant/snapshots/recent/');
        if (!response.ok) return;

        const data = await response.json();
        setSnapshots(data);
      } catch (error) {
        console.log(error);
      }
    };

    getSnapshots();
  }, []);

  const currentMonth = () => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long' }).toLowerCase();
  };

  return (
    <div className="card-full">
      <h2>{t('snapshots.label')}</h2>
      <div className="card-container">
        {snapshots.length === 0 ? (
        <p>{t('snapshots.no_recent_snapshots')}</p>
        ) : (
          <>
          <p>{t('snapshots.month_snapshot_ready', { month: t(`general.month.${currentMonth()}`) })}</p>
            <ul className="snapshot-group">
              {snapshots.map(snapshot => (
                <li 
                  key={snapshot.id}
                  className="home-item"
                  onClick={() => viewFile(snapshot.file)}
                >
                  {t(`snapshots.${snapshot.type}`)}
                </li>
              ))}
            </ul>
          </>
        )}
        <div 
          className="home-item"
          onClick={() => navigate('/settings')}
        >
          {t('snapshots.see_archived')}
        </div>
      </div>
    </div>
  );
}

export default HomeSnapshotCard;
