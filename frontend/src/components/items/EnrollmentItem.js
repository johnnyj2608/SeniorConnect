import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NameDisplay from '../layout/NameDisplay';
import { formatDate } from '../../utils/formatUtils'

const AuditItem = ({ enrollment }) => {
  const { t } = useTranslation();

  const renderEnrollmentMessage = (old_mltc, new_mltc) => {
    if (old_mltc && new_mltc) {
        return `${old_mltc} → ${new_mltc}`;
    } else if (new_mltc) {
        return new_mltc
    } else if (old_mltc) {
        return old_mltc
    } else {
        return
    }
  };

  return (
    <li>
      <Link to={`/members/${enrollment.member_id}`} className="home-item">
        <span className="home-item-primary">
          <p>
            <NameDisplay
              sadcId={enrollment.sadc_member_id}
              memberName={enrollment.member_name}
              altName={enrollment.member_alt_name}
            />
          </p>
          <p>— {formatDate(enrollment.change_date)}</p>
        </span>
        <span className="home-item-secondary">
          <p>{t(`reports.enrollments.${enrollment.change_type}`)}</p> 
          <p>{renderEnrollmentMessage(enrollment.old_mltc_name, enrollment.new_mltc_name)}</p>
        </span>
      </Link>
    </li>
  );
};

export default memo(AuditItem);