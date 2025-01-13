import React from 'react'
import { Link } from 'react-router-dom'

let getTime = (member) => {
  return new Date(member.updated).toLocaleDateString()
}

const ListItem = ({member}) => {
  return (
    <Link to={`/member/${member.id}`}>
      <div className="members-list-item">
        <h3>{member.first_name} {member.last_name}</h3>
        <p><span>{getTime(member)}</span></p>
      </div>
    </Link>
  )
}

export default ListItem
