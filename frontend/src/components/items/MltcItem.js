import React, { memo } from 'react';
import { colorStats } from '../../utils/colorUtils';

const MltcItem = ({ item, change }) => {
  const netChange = change ? change[item.name] ?? 0 : 0;

  return (
    <div className="stats-mltc">
      <h4>{item.name}</h4>
      <p>{item.count}</p>
      <p>{colorStats(item.count, netChange)}</p>
    </div>
  );
};

export default memo(MltcItem);