import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { colorStats } from '../../utils/colorUtils';

const MltcItem = ({ item, change }) => {
  const mltcName = item.name || 'Unknown';
  const netChange = change ? change[mltcName] ?? 0 : 0;

  return (
    <Link
      to={`/members?mltc=${encodeURIComponent(mltcName)}`}
      className="stats-mltc"
    >
      <h4>{mltcName}</h4>
      <p>{item.count}</p>
      <p>{colorStats(item.count, netChange)}</p>
    </Link>
  );
};

export default memo(MltcItem);
