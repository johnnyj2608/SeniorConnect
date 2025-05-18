import React, { useState, useEffect } from 'react';
import { ReactComponent as DropdownIcon } from '../../assets/dropdown.svg';
import { Link } from 'react-router-dom';
import { formatChangeStatus } from '../../utils/statusUtils';

const HomeStatsCard = () => {
  const [stats, setStats] = useState(null);
  const [change, setChange] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const getStats = async () => {
      const response = await fetch(`/core/members/stats/`)
      const data = await response.json();
      setStats(data);
    };

    const getChange = async () => {
      const response = await fetch(`/core/enrollments/stats/`)
      const data = await response.json();
      setChange(data);
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
            {formatChangeStatus(+5, change?.Overall ?? 0)}
          </p>  
          <span
            className={`dropdown-icon ${showDetails ? 'open' : ''}`}
            onClick={toggleDetails}
          >
            <DropdownIcon />
          </span>
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
