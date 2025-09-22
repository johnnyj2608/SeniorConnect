import React, { memo }  from 'react'
import { Link } from 'react-router'
import { ReactComponent as AddIcon } from '../../assets/add.svg'

const AddButton = () => {
  return (
    <Link to="/members/new" className="floating-button" aria-label="Add member">
        <span className="add-icon">
          <AddIcon />
        </span>
    </Link>
  )
}

export default memo(AddButton)