import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const AuditItem = ({ audit }) => {
  const { t } = useTranslation();

  return (
    <li>
      <Link to={`/member/${audit.member}`} className="home-item">
        <span className="home-item-title">
          <p className="home-item-primary">{audit.member_name}</p>
          <p className="home-item-sub">
            — {t(`model.${audit.model_name}`)}
          </p>
        </span>
        <span className="home-item-title">
          <p className="home-item-primary">
            {t(`home.${audit.action_type}`, { user: audit.user_name })}
          </p>
          <p className="home-item-sub">{audit.user_name}</p> 
        </span>
      </Link>
    </li>
  );
};

export default memo(AuditItem);