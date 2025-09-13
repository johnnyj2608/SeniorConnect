import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { colorStats } from '../../utils/colorUtils';

const MltcItem = ({ item, change }) => {
  const netChange = change ? change[item.name] ?? 0 : 0;

  return (
    <Link
      to={`/members?mltc=${encodeURIComponent(item.name)}`}
      className="stats-mltc"
    >
      <h4>{item.name}</h4>
      <p>{item.count}</p>
      <p>{colorStats(item.count, netChange)}</p>
    </Link>
  );
};

export default memo(MltcItem);