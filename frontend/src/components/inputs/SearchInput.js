import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

const SearchInput = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <input
      type="text"
      placeholder={t('members.search_id_or_name')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default memo(SearchInput);