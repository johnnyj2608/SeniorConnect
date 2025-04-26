import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatPhone, formatSchedule } from '../../utils/formatUtils';

const ListItem = ({ member }) => {
  return (
    <div className="members-list-item">
      <Link to={`/member/${member.id}`}>
        <img 
            src={member.photo instanceof File ? URL.createObjectURL(member.photo) : member.photo || "/default-profile.jpg"} 
            alt={member.first_name ? `${member.first_name} ${member.last_name}` : "Member"} 
            className="members-list-photo"
            onError={(e) => e.target.src = "/default-profile.jpg"}
        />
        <div className="members-list-details">
          <h3>{member.sadc_member_id}. {member.last_name}, {member.first_name}</h3>
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

export default ListItem
