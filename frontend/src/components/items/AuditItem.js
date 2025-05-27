import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const AuditItem = ({ audit }) => {
  return (
    <li>
      <Link to={`/member/${audit.member}`} className="home-item">
        <span>
            {audit.member_name} — {audit.model_name}
        </span>
        <span>  
            {audit.action_type}d by <strong>{audit.user_name}</strong>
        </span>
      </Link>
    </li>
  );
};

export default memo(AuditItem);