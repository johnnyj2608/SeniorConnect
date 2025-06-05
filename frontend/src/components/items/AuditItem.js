import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const AuditItem = ({ audit }) => {
  const { t } = useTranslation();

  return (
    <li>
      <Link to={`/member/${audit.member}`} className="home-item">
        <span className="home-item-primary">
          <p>{audit.member_name}</p>
          <p>— {audit.user_name}</p>
        </span>
        <span className="home-item-secondary">
          <p>{t(`home.${audit.action_type}`)}</p>
          <p>{t(`model.${audit.model_name}`)}</p>
        </span>
      </Link>
    </li>
  );
};

export default memo(AuditItem);