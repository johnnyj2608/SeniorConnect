import React from 'react';

const SearchInput = ({ value, onChange }) => {
  return (
    <input className="member-search"
      type="text"
      placeholder={'Search ID or Name'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default SearchInput;
