import React from 'react';

const StatusBanner = ({ status }) => {
  if (status === undefined || status === null || status === true) return null;

  return (
    <div className="inactive-banner">
      MEMBER IS INACTIVE
    </div>
  );
};

export default StatusBanner;
