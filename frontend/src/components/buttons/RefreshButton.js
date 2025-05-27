import React, { memo } from 'react';
import { ReactComponent as Refresh } from '../../assets/refresh.svg';

const RefreshButton = ({ onClick }) => {
  return (
    <button className="icon-button" onClick={onClick}>
      <Refresh />
    </button>
  );
};

export default memo(RefreshButton);