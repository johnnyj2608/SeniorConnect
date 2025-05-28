import React, { memo } from 'react';
import { ReactComponent as Dropdown } from '../../assets/dropdown.svg';

const DropdownButton = ({ showDetails, toggleDetails, className = '' }) => {
  return (
    <button
      className={`icon-button dropdown-icon ${showDetails ? 'open' : ''} ${className}`}
      onClick={toggleDetails}
    >
      <Dropdown />
    </button>
  );
};

export default memo(DropdownButton);
