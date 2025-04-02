import React, {useState, useEffect} from 'react'
import ListItem from '../components/ListItem'
import AddButton from '../components/AddButton'
import DownloadButton from '../components/DownloadButton'
import MltcDropdown from '../components/Dropdown';
import SearchInput from '../components/SearchInput';
import groupMembersByMltc from '../utils/groupMembersByMltc';

const MembersListPage = () => {

  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mltcFilter, setMltcFilter] = useState('');
  const [mltcOptions, setMltcOptions] = useState([]);

  const getMembers = async () => {
    const response = await fetch('/core/members')
    const data = await response.json()
      setMembers(data)
  }

  const getMltcOptions = async () => {
    const response = await fetch('/core/mltcs/');
    const data = await response.json();
    setMltcOptions(data);
  };

  useEffect(() => {
    getMembers();
    getMltcOptions();
  }, []);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.sadc_member_id.toString().startsWith(searchQuery) ||
      member.first_name.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
      member.last_name.toLowerCase().startsWith(searchQuery.toLowerCase());

    const matchesMltc = mltcFilter === 'Unknown'
      ? (member.mltc_id === null || member.mltc_id === undefined)
      : (mltcFilter ? member.mltc_id === parseInt(mltcFilter) : true);
    return matchesSearch && matchesMltc;
  });

  const membersByMltc = groupMembersByMltc(filteredMembers, mltcOptions);
  console.log(mltcOptions)

  return (
    <div className="members">
      <div className="members-header">
        <h2 className="members-title">&#9782; Members</h2>
        <h3>
        <DownloadButton membersByMltc={membersByMltc} />
        </h3>
      </div>

      <div className="filters">
        <MltcDropdown 
          value={mltcFilter} 
          onChange={(e) => setMltcFilter(e.target.value)} 
          options={[...mltcOptions, { name: 'Unknown' }]} 
        />
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
        <p className="members-count">
          {filteredMembers.length} {filteredMembers.length === 1 ? 'result' : 'results'}
        </p>
      </div>

      {Object.entries(membersByMltc)
        .sort(([mltcA], [mltcB]) => {
          if (mltcA === 'Unknown') return 1;
          if (mltcB === 'Unknown') return -1;
          return mltcA.localeCompare(mltcB);
        })
        .map(([mltcName, members]) => (
        <div key={mltcName}>
          <h3 className="mltc-section">{mltcName}</h3>
          {members.map((member) => (
            <ListItem key={member.id} member={member} />
          ))}
        </div>
      ))}

      <AddButton />
    </div>
  )
}

export default MembersListPage
