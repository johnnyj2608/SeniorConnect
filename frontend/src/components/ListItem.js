import React from 'react';
import { Link } from 'react-router-dom'

const ListItem = ({member, mltcOptions}) => {
  const mltcName = mltcOptions.find(option => option.id === member.mltc)?.name || 'N/A';

  return (
    <Link to={`/member/${member.id}`}>
      <div className="members-list-item">
        <h3>{member.first_name} {member.last_name}</h3>
        <p><span>{mltcName} #{member.sadc_member_id}</span></p>
      </div>
    </Link>
  )
}

export default ListItem
