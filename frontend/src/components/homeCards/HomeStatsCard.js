import React, { useState, useEffect } from 'react';
import { ReactComponent as DropdownIcon } from '../../assets/dropdown.svg';
import { Link } from 'react-router-dom';

const HomeStatsCard = () => {
  const [stats, setStats] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const getStats = async () => {
        const response = await fetch(`/core/members/stats/`)
        const data = await response.json();
        setStats(data);
    };

    getStats();
    
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
          <p className="stats-change ">+5 (2%)</p>
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
                return (
                  <Link
                    key={mltcName}
                    to={`/members?mltc=${encodeURIComponent(mltcName)}`}
                    className="stats-mltc"
                  >
                    <h4>{mltcName}</h4>
                    <p>{item.count} (+3%)</p>
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
