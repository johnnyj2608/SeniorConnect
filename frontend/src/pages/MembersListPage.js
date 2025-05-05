import React, { useState, useEffect } from 'react';
import ListItem from '../components/members/ListItem';
import AddButton from '../components/buttons/AddButton';
import DownloadButton from '../components/buttons/DownloadButton';
import Dropdown from '../components/inputs/Dropdown';
import SearchInput from '../components/inputs/SearchInput';
import Switch from 'react-switch';
import useFilters from '../hooks/useFilters';

const MembersListPage = () => {
  const [members, setMembers] = useState([]);
  const [mltcOptions, setMltcOptions] = useState([]);

  const getMembers = async () => {
    const response = await fetch('/core/members');
    const data = await response.json();
    setMembers(data);
  };

  const getMltcOptions = async () => {
    const response = await fetch('/core/mltcs/');
    const data = await response.json();
    setMltcOptions(data);
  };

  useEffect(() => {
    getMembers();
    getMltcOptions();
  }, []);

  const {
    searchQuery,
    setSearchQuery,
    mltcFilter,
    setMltcFilter,
    scheduleFilter,
    setScheduleFilter,
    showInactive,
    setShowInactive,
    filteredMembers,
    membersByMltc,
  } = useFilters(members, mltcOptions);

  return (
    <div className="members">
      <div className="members-header">
        <div className="members-title-row">
          <h2 className="members-title">&#9782; Members</h2>
          <h2>
            <DownloadButton membersByMltc={membersByMltc} />
          </h2>
        </div>
        <div className="filter-row">
          <div className="filter-content">
            <div className="filter-option">
              <label>Search Members</label>
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="filter-option">
              <label>MLTC Filter</label>
              <Dropdown
                display={mltcFilter}
                onChange={(e) => setMltcFilter(e.target.value)}
                options={[...mltcOptions, { name: 'Unknown' }]}
              />
            </div>

            <div className="filter-option">
              <label>Schedule Filter</label>
              <Dropdown
                display={scheduleFilter}
                onChange={(e) => setScheduleFilter(e.target.value)}
                options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
                multiSelect={true}
              />
            </div>

            <div className="filter-option">
              <label>Inactive</label>
              <div className="switch-container">
                <Switch
                  checked={showInactive}
                  onChange={() => setShowInactive(!showInactive)}
                  onColor="#76A9FA"
                />
              </div>
            </div>

            <button
              className="reset-button"
              onClick={() => {
                setSearchQuery('');
                setMltcFilter('');
                setScheduleFilter([
                  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
                ]);
                setShowInactive(false);
              }}
            >
              Reset Filters
            </button>

          </div>
          <p className="members-count">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'result' : 'results'}
          </p>
        </div>
      </div>

      <div className="members-list-content">
        {Object.entries(membersByMltc)
          .sort(([mltcA], [mltcB]) => {
            if (mltcA === 'Unknown') return 1;
            if (mltcB === 'Unknown') return -1;
            return mltcA.localeCompare(mltcB);
          })
          .map(([mltc, members]) => (
            <div key={mltc}>
              <h3 className="mltc-section">{mltc}</h3>
              <div className="members-list">
                {members.map((member) => (
                  <ListItem key={member.id} member={member} />
                ))}
              </div>
            </div>
          ))}
      </div>
      <AddButton />
    </div>
  );
};

export default MembersListPage;