import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import { openFile } from '../../utils/fileUtils';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const HomeSnapshotCard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    if (!user?.view_snapshots) return;

    const getSnapshots = async () => {
      if (!user.view_snapshots && !user.is_org_admin) return;
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
  }, [user]);

  const now = new Date();
  const monthIndex = now.getMonth();

  if (!user.view_snapshots && !user.is_org_admin) return null;

  return (
    <div className="card-full">
      <h2>{t('snapshots.label')}</h2>
      <div className="card-container">
        {snapshots.length !== 0 && (
          <>
            <p>{t('snapshots.month_snapshot_ready', { month: t(`general.month.${monthIndex}`) })}</p>
            <ul className="snapshot-group">
              {snapshots.map(snapshot => {
                const label = t(`snapshots.${snapshot.type}`);
                if (snapshot.type === 'birthdays') {
                  const birthdayMonth = monthIndex + 1;
                  return (
                    <li 
                      key={snapshot.id}
                      className="home-item"
                      onClick={() => openFile(snapshot.file)}
                    >
                      {t(`general.month.${birthdayMonth}`)} {label}
                    </li>
                  );
                }

                return (
                  <li 
                    key={snapshot.id}
                    className="home-item"
                    onClick={() => openFile(snapshot.file)}
                  >
                    {label}
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <div 
          className="home-item"
          onClick={() => navigate('/reports?type=snapshots')}
        >
          {t('snapshots.see_archived')}
        </div>
      </div>
    </div>
  );
}

export default HomeSnapshotCard;
