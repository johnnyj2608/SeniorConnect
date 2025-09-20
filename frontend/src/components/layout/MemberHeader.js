import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchMembers from '../inputs/SearchMembers';
import AttendanceButton from '../buttons/AttendanceButton';
import MltcFilter from '../inputs/MltcFilter';

const MemberHeader = ({ navigate, handleOpenAttendance }) => {
  const { t } = useTranslation();

  const [mltcFilter, setMltcFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="page-header">
      <div className="page-title-row">
        <h2 className="page-title">&#9782; {t('general.members')}</h2>
        <AttendanceButton onClick={handleOpenAttendance} />
      </div>

      <div className="filter-row">
        <div className="filter-content">
          <div className="filter-option">
            <label>{t('members.mltc_filter')}</label>
            <MltcFilter
              value={mltcFilter}
              onChange={setMltcFilter}
            />
          </div>

          <div className="filter-option large">
            <label>{t('members.search_members')}</label>
            <SearchMembers
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={(member) => {
                setSearchQuery('');
                navigate(`/members/${member.id}`);
              }}
              mltcFilter={mltcFilter}
            />
          </div>

        </div>
        <div>
          <p
            className="filter-text clickable"
            onClick={() => {
              setMltcFilter('');
              setSearchQuery('');
            }}
          >
            {t('general.buttons.clear_filters')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberHeader;