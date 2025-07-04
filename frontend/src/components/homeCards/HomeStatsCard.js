import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DropdownButton from '../buttons/DropdownButton';
import MltcItem from '../items/MltcItem';
import { colorStats } from '../../utils/colorUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const HomeStatsCard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [change, setChange] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const getStats = async () => {
      try {
        const response = await fetchWithRefresh('/core/members/stats/');
        if (!response.ok) return;

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.log(error);
      }
    };

    const getChange = async () => {
      try {
        const response = await fetchWithRefresh('/audit/enrollments/stats/');
        if (!response.ok) return;

        const data = await response.json();
        setChange(data);
      } catch (error) {
        console.log(error);
      }
    };

    getStats();
    getChange();
  }, []);


  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  return (
    <div className="card-full">
      <h2>{t('snapshots.members')}</h2>
      <div className="card-container">
        <div className="stats-container">
          <h3 className="stats-count">{stats ? stats.active_count : '...'}</h3>
          <p className="stats-change">
            {colorStats(stats?.active_count, change?.Overall ?? 0)}
          </p>
          <DropdownButton 
            showDetails={showDetails} 
            toggleDetails={toggleDetails} 
          />
          {showDetails && stats?.mltc_count && (
          <div className="stats-mltcs">
            {stats.mltc_count.map(item => (
              <MltcItem
                key={item.name || 'unknown'}
                item={item}
                change={change}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default HomeStatsCard
