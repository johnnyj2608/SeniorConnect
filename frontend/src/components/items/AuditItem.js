import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const AuditItem = ({ audit }) => {
  return (
    <li>
      <Link to={`/member/${audit.member}`} className="home-item">
        <span>
          <strong>{audit.user_name}</strong>{' '}
          {audit.action_type.toLowerCase()}d {audit.member_name} | {audit.model_name}
        </span>
      </Link>
    </li>
  );
};

export default memo(AuditItem);