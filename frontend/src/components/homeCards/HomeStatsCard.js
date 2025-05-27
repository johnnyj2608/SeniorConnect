import React, { useState, useEffect } from 'react';
import DropdownButton from '../buttons/DropdownButton';
import { Link } from 'react-router-dom';
import { formatChangeStatus } from '../../utils/statusUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const HomeStatsCard = () => {
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
        console.log('Failed to fetch stats:', error);
      }
    };

    const getChange = async () => {
      try {
        const response = await fetchWithRefresh('/core/enrollments/stats/');
        if (!response.ok) return;

        const data = await response.json();
        setChange(data);
      } catch (error) {
        console.log('Failed to fetch change stats:', error);
      }
    };

    getStats();
    getChange();
  }, []);


  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  return (
    <div className="full-card">
      <h3>Members</h3>
      <div className="card-container">
        <div className="stats-container">
          <h3 className="stats-count">{stats ? `${stats.active_count}` : '...'}</h3>
          <p className="stats-change ">
            {formatChangeStatus(stats?.active_count, change?.Overall ?? 0)}
          </p>
          <DropdownButton showDetails={showDetails} toggleDetails={toggleDetails} />
          {showDetails && stats?.mltc_count && (
            <div className="stats-mltcs">
              {stats.mltc_count.map(item => {
                const mltcName = item.name || 'Unknown';
                const netChange = change ? change[mltcName] ?? 0 : 0;

                return (
                  <Link
                    key={mltcName}
                    to={`/members?mltc=${encodeURIComponent(mltcName)}`}
                    className="stats-mltc"
                  >
                    <h4>{mltcName}</h4>
                    <p>{item.count}</p>
                    <p>{formatChangeStatus(item.count, netChange)}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomeStatsCard
