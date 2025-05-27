import React, { memo } from 'react';
import { ReactComponent as Dropdown } from '../../assets/dropdown.svg';

const DropdownButton = ({ showDetails, toggleDetails }) => {
  return (
    <button
      className={`dropdown-icon ${showDetails ? 'open' : ''}`}
      onClick={toggleDetails}
    >
      <Dropdown />
    </button>
  );
};

export default memo(DropdownButton);
