import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatPhone } from '../utils/formatUtils';

const ListItem = ({ member }) => {
  return (
    <Link to={`/member/${member.id}`}>
      <div className="members-list-item">
        <h3>{member.sadc_member_id}. {member.last_name}, {member.first_name}</h3>
        <p>{formatDate(member.birth_date)}</p>
        <p>{formatPhone(member.phone)}</p>
        <p>{member.address}</p>
        {/* Display SADC schedule when authorization table set up */}
      </div>
    </Link>
  )
}

export default ListItem
