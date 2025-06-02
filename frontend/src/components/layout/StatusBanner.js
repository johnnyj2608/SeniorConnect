import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

const StatusBanner = ({ status }) => {
  const { t } = useTranslation();
  if (status === undefined || status === null || status === true) return null;

  return (
    <div className="inactive-banner">
      {t('status.member_is_inactive')}
    </div>
  );
};

export default memo(StatusBanner);
