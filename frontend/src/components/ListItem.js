import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatPhone } from '../utils/formatUtils';

const ListItem = ({ member }) => {
  return (
    <Link to={`/member/${member.id}`}>
      <div className="members-list-item">
        <img 
            src={member.photo instanceof File ? URL.createObjectURL(member.photo) : member.photo || "/default-profile.jpg"} 
            alt="Member Photo" 
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
          <p>{formatPhone(member.phone)}</p>
        </div>
        <p>{member.address}</p>
        {/* Display SADC schedule when authorization table set up */}
      </div>
    </Link>
  )
}

export default ListItem
