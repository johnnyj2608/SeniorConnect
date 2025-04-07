import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatPhone, formatSchedule } from '../utils/formatUtils';

const ListItem = ({ member }) => {
  return (
    <Link to={`/member/${member.id}`}>
      <div className="members-list-item">
        <img 
            src={member.photo instanceof File ? URL.createObjectURL(member.photo) : member.photo || "/default-profile.jpg"} 
            alt={member.first_name ? `${member.first_name} ${member.last_name}` : "Member"} 
            className="members-list-photo"
            onError={(e) => e.target.src = "/default-profile.jpg"}
        />
        <div className="members-list-name">
          <p>{member.sadc_member_id}. {member.last_name}, {member.first_name}</p>
        </div>
        <div className="members-list-birthdate">
          <p>{formatDate(member.birth_date)}</p>
        </div>
        <div className="members-list-phone">
          {member.phone ? <p>{formatPhone(member.phone)}</p> : null}
        </div>
        <div className="members-list-birthdate">
          {member.schedule ? <p>{formatSchedule(member.schedule, true)}</p> : null}
        </div>
      </div>
    </Link>
  )
}

export default ListItem
