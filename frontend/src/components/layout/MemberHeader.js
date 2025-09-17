import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Switch from 'react-switch';
import SearchMembers from '../inputs/SearchMembers';
import AttendanceButton from '../buttons/AttendanceButton';
import { MltcContext } from '../../context/MltcContext';

const MemberHeader = ({ navigate, handleOpenAttendance }) => {
  const { t } = useTranslation();
  const { mltcs, refreshMltc } = useContext(MltcContext);

  const [mltcFilter, setMltcFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);

useEffect(() => {
  refreshMltc();
}, [refreshMltc]);

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
            <select
              required
              value={mltcFilter}
              onChange={(e) => setMltcFilter(e.target.value)}
            >
              <option value="">{t('general.select_an_option')}</option>
              {mltcs.map((option) => (
                <option key={option.name} value={option.name}>
                  {option.name}
                </option>
              ))}
              <option value="unknown">{t('members.no_mltc')}</option>
            </select>
          </div>

          <div className="filter-option">
            <label>{t('members.search_members')}</label>
            <SearchMembers
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={(member) => {
                setSearchQuery('');
                navigate(`/members/${member.id}`);
              }}
              showInactive={showInactive}
              mltcFilter={mltcFilter}
            />
          </div>

          <div className="filter-option">
            <label>{t('members.inactive')}</label>
            <div className="switch-container">
              <Switch
                checked={showInactive}
                onChange={() => setShowInactive(!showInactive)}
                onColor="#6366F1"
              />
            </div>
          </div>
        </div>
        <div>
          <p
            className="filter-text clickable"
            onClick={() => {
              setMltcFilter('');
              setSearchQuery('');
              setShowInactive(false);
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