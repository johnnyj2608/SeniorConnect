import React from 'react'
import { Link } from 'react-router-dom'

const ListItem = ({member}) => {
  return (
    <Link to={`/member/${member.id}`}>
      <h3>{member.first_name} {member.last_name}</h3>
    </Link>
  )
}

export default ListItem
