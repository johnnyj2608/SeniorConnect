import React from 'react';
import { ReactComponent as AngleRight } from '../../assets/angle-right.svg';

const SettingsItem = ({ label, onClick, isNav=false, isActive=false }) => {
  return (
    <div
      className={`settings-item ${isNav ? 'nav' : ''} ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <span>{label}</span>
      <AngleRight />
    </div>
  );
};

export default SettingsItem;
