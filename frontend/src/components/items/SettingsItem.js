import React from 'react';
import { ReactComponent as AngleRight } from '../../assets/angle-right.svg';

const SettingsItem = ({ label, isActive, onClick }) => {
  return (
    <div
      className={`settings-nav-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <span>{label}</span>
      <AngleRight />
    </div>
  );
};

export default SettingsItem;
