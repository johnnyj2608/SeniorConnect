import React from 'react';
import { ReactComponent as AngleRight } from '../../assets/angle-right.svg';

const SettingsItem = ({
  label,
  onClick,
  isNav = false,
  isActive = false,
  component = null,
}) => {
  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={
        `settings-item${isNav ? ' nav' : ''}${isActive ? ' active' : ''}${isClickable ? ' clickable' : ''}`
      }
      onClick={onClick}
    >
      <span>{label}</span>
        {component ? component : <AngleRight />}
    </div>
  );
};

export default SettingsItem;
