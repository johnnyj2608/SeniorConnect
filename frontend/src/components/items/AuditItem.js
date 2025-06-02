import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const AuditItem = ({ audit }) => {
  return (
    <li>
      <Link to={`/member/${audit.member}`} className="home-item">
        <span className="home-item-title">
          <p className="home-item-primary">{audit.member_name}</p>
          <p className="home-item-sub">— {audit.model_name}</p>
        </span>
        <span className="home-item-title">
          <p className="home-item-primary">{audit.action_type}d by</p>
          <p className="home-item-sub">{audit.user_name}</p> 
        </span>
      </Link>
    </li>
  );
};

export default memo(AuditItem);