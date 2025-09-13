import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NameDisplay from '../layout/NameDisplay';

const AuditItem = ({ audit }) => {
  const { t } = useTranslation();

  return (
    <li>
      <Link to={`/members/${audit.member}`} className="home-item">
        <span className="home-item-primary">
          <p>
            <NameDisplay
              sadcId={audit.sadc_member_id}
              memberName={audit.member_name}
              altName={audit.alt_name}
            />
          </p>
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