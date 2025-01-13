import React from 'react'
import { Link } from 'react-router-dom'

const ListItem = ({member}) => {
  return (
    <Link to={`/member/${member.id}`}>
      <div className="members-list-item">
        <h3>{member.first_name} {member.last_name}</h3>
      </div>
    </Link>
  )
}

export default ListItem
