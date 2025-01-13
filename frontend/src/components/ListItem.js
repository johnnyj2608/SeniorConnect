import React from 'react'

const ListItem = ({member}) => {
  return (
    <div>
      <h3>{member.first_name} {member.last_name}</h3>
    </div>
  )
}

export default ListItem
