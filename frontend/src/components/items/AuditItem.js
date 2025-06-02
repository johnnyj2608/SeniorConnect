import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const AuditItem = ({ audit }) => {
  return (
    <li>
      <Link to={`/member/${audit.member}`} className="home-item">
        <span className="home-item-title">
          <p>{audit.member_name}</p>
          <p>— {audit.model_name}</p>
        </span>
        <span className="home-item-title">
          <p>{audit.action_type}d by</p>
          <p>{audit.user_name}</p> 
        </span>
      </Link>
    </li>
  );
};

export default memo(AuditItem);