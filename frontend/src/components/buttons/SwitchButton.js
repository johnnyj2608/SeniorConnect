import React, { memo } from 'react';
import { ReactComponent as Switch } from '../../assets/switch.svg';

const SwitchButton = ({ onClick }) => {
  return (
    <button className="icon-button" onClick={onClick}>
      <Switch />
    </button>
  );
};

export default memo(SwitchButton);