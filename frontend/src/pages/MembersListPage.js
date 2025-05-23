import React, { useState, useEffect } from 'react';
import ListItem from '../components/members/ListItem';
import AddButton from '../components/buttons/AddButton';
import DownloadButton from '../components/buttons/DownloadButton';
import SearchInput from '../components/inputs/SearchInput';
import Switch from 'react-switch';
import useFilters from '../hooks/useFilters';
import { useLocation } from 'react-router-dom';
import fetchWithRefresh from '../utils/fetchWithRefresh'

const MembersListPage = () => {
  const [members, setMembers] = useState([]);
  const [mltcOptions, setMltcOptions] = useState([]);

  const getMembers = async () => {
    try {
      const response = await fetchWithRefresh('/core/members');
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getMltcOptions = async () => {
    try {
      const response = await fetchWithRefresh('/core/mltcs/');
      if (!response.ok) {
        throw new Error('Failed to fetch MLTC options');
      }
      const data = await response.json();
      setMltcOptions(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getMembers();
    getMltcOptions();
  }, []);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mltcQueryParam = queryParams.get('mltc');

  const {
    searchQuery,
    setSearchQuery,
    mltcFilter,
    setMltcFilter,
    showInactive,
    setShowInactive,
    filteredMembers,
  } = useFilters(members);

  useEffect(() => {
    if (mltcQueryParam && mltcFilter !== mltcQueryParam) {
      setMltcFilter(mltcQueryParam);
    }
  }, [mltcQueryParam, mltcFilter, setMltcFilter]);

  const totalFilteredMembers = filteredMembers.reduce((count, mltc) => {
    return count + mltc.member_list.length;
  }, 0);

  return (
    <>
      <div className="page-header">
        <div className="page-title-row">
          <h2 className="page-title">&#9782; Members</h2>
          <h2>
            <DownloadButton members={filteredMembers} />
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
              <select 
                value={mltcFilter} 
                onChange={(e) => setMltcFilter(e.target.value)}>
              <option value="">Select an option</option>
              {mltcOptions.map((option) => (
                  <option key={option.name} value={option.name}>
                      {option.name}
                  </option>
              ))}
              <option value="Unknown">Unknown</option>
              </select>
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
          </div>

          <p className="members-count">
            {totalFilteredMembers} {totalFilteredMembers === 1 ? 'result' : 'results'}
          </p>
        </div>
      </div>

      <div className="members-list-content">
        {filteredMembers
          .map((mltc) => (
            <div key={mltc.name}>
              <h3 className="section-title">{mltc.name}</h3>
              <div className="members-list">
                {mltc.member_list.map((member) => (
                  <ListItem key={member.id} member={member} />
                ))}
              </div>
            </div>
          ))}
      </div>

      <AddButton />
    </>
  );
};

export default MembersListPage;