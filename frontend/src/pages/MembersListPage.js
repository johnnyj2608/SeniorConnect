import React, { useState, useEffect } from 'react'
import ListItem from '../components/ListItem'
import AddButton from '../components/AddButton'
import DownloadButton from '../components/DownloadButton'
import Dropdown from '../components/Dropdown'
import SearchInput from '../components/SearchInput'
import groupMembersByMltc from '../utils/groupMembersByMltc'
import Switch from 'react-switch';

const MembersListPage = () => {
  const [members, setMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [mltcFilter, setMltcFilter] = useState('')
  const [mltcOptions, setMltcOptions] = useState([])
  const [sortOption, setSortOption] = useState('')
  const [scheduleFilter, setScheduleFilter] = useState([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]); 
  const [showInactive, setShowInactive] = useState(false);

  const getMembers = async () => {
    const response = await fetch('/core/members')
    const data = await response.json()
    setMembers(data)
  }

  const getMltcOptions = async () => {
    const response = await fetch('/core/mltcs/')
    const data = await response.json()
    setMltcOptions(data)
  }

  useEffect(() => {
    getMembers()
    getMltcOptions()
  }, [])

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.sadc_member_id.toString().startsWith(searchQuery) ||
      member.first_name.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
      member.last_name.toLowerCase().startsWith(searchQuery.toLowerCase());

    const matchesMltc = mltcFilter 
      ? mltcFilter === member.mltc || (mltcFilter === 'Unknown' && member.mltc === null)
      : true;

    const matchesSchedule = scheduleFilter.length === 7 
      ? true
      : member.schedule?.some(day => scheduleFilter.includes(day));

    const matchesDisenrolled = showInactive ? true : member.active;

    return matchesSearch && matchesMltc && matchesSchedule && matchesDisenrolled
  });

  const sortMembers = (members) => {
    switch (sortOption) {
      case 'Member ID (0-9)':
        return [...members].sort((a, b) => a.sadc_member_id - b.sadc_member_id)
      case 'Member ID (9-0)':
        return [...members].sort((a, b) => b.sadc_member_id - a.sadc_member_id)
      case 'Last Name (A-Z)':
        return [...members].sort((a, b) => a.last_name.localeCompare(b.last_name))
      case 'Last Name (Z-A)':
        return [...members].sort((a, b) => b.last_name.localeCompare(a.last_name))
      case 'First Name (A-Z)':
        return [...members].sort((a, b) => a.first_name.localeCompare(b.first_name))
      case 'First Name (Z-A)':
        return [...members].sort((a, b) => b.first_name.localeCompare(a.first_name))
      default:
        return members
    }
  }

  const sortedMembers = sortMembers(filteredMembers);
  const membersByMltc = groupMembersByMltc(sortedMembers, mltcOptions);

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
              <label htmlFor="searchQuery">Search Members</label>
              <SearchInput
                id="searchQuery"
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            <div className="filter-option">
              <label htmlFor="mltcFilter">MLTC Filter</label>
              <Dropdown
                id="mltcFilter"
                value={mltcFilter}
                onChange={(e) => setMltcFilter(e.target.value)}
                options={[...mltcOptions, { name: 'Unknown' }]}
              />
            </div>

            <div className="filter-option">
              <label htmlFor="sortOption">Sort By</label>
              <Dropdown
                id="sortOption"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                options={[
                  'Member ID (0-9)',
                  'Member ID (9-0)',
                  'Last Name (A-Z)',
                  'Last Name (Z-A)',
                  'First Name (A-Z)',
                  'First Name (Z-A)',
                ]}
              />
            </div>

            <div className="filter-option">
              <label htmlFor="sortOption">Schedule Filter</label>
              <Dropdown
                id="scheduleFilter"
                value={(scheduleFilter)}
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
          </div>
          <p className="members-count">
            {sortedMembers.length} {sortedMembers.length === 1 ? 'result' : 'results'}
          </p>
        </div>
      </div>

      <div className="members-list-content">
        {Object.entries(membersByMltc)
          .sort(([mltcA], [mltcB]) => {
            if (mltcA === 'Unknown') return 1
            if (mltcB === 'Unknown') return -1
            return mltcA.localeCompare(mltcB)
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
  )
}

export default MembersListPage
