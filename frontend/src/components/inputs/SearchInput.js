import React, { memo } from 'react';

const SearchInput = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder={'Search ID or Name'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default memo(SearchInput);
