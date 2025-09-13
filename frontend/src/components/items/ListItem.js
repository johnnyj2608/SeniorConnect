import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate, formatPhone, formatSchedule, formatPhoto } from '../../utils/formatUtils';
import NameDisplay from '../layout/NameDisplay';

const ListItem = ({ member }) => {
  const { t } = useTranslation();

  return (
    <div className="members-list-item">
      <Link to={`/member/${member.id}`}>
        <div className="members-list-photo-container">
          {member.new && <span className="members-list-item-new">{t('members.new')}</span>}
          <img 
            src={formatPhoto(member.photo)} 
            alt={member.first_name ? `${member.first_name} ${member.last_name}` : t('member.info.label')} 
            className="members-list-photo"
            onError={(e) => e.target.src = "/default-profile.jpg"}
            loading="lazy"
          />
        </div>
        <div className="members-list-details">
          <h3>
            <NameDisplay
              sadcId={member.sadc_member_id}
              memberName={`${member.last_name}, ${member.first_name}`}
              altName={member.alt_name}
            />
          </h3>
          <p>{formatDate(member.birth_date)}</p>
          {member.phone && (
              <p>{formatPhone(member.phone)}</p>
          )}
          {member.schedule && (
              <p>{formatSchedule(member.schedule, true)}</p>
          )}
        </div>
      </Link>
    </div>
  )
}

export default memo(ListItem)
