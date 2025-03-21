import React, {useState, useEffect} from 'react'
import ListItem from '../components/ListItem'
import AddButton from '../components/AddButton'
import DownloadButton from '../components/DownloadButton'
import MltcDropdown from '../components/MltcDropdown';
import SearchInput from '../components/SearchInput';

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
    const response = await fetch('/core/mltc/');
    const data = await response.json();
    setMltcOptions(data);
  };

  useEffect(() => {
    getMembers();
    getMltcOptions();
  }, []);

  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
        member.sadc_member_id.toString().includes(searchQuery) || 
        member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.last_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMltc = mltcFilter ? member.mltc.toString() === mltcFilter : true;

    return matchesSearch && matchesMltc;
  });

  return (
    <div className="members">
      <div className="members-header">
        <h2 className="members-title">&#9782; Members</h2>
        <DownloadButton members={members} mltcOptions={mltcOptions} />
      </div>

      <div className="filters">
        <MltcDropdown value={mltcFilter} onChange={(e) => setMltcFilter(e.target.value)} options={mltcOptions} />
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
        <p className="members-count">
          {filteredMembers.length} {filteredMembers.length === 1 ? 'result' : 'results'}
        </p>
      </div>
      
      {filteredMembers.map((member) => (
          <ListItem key={member.id} member={member} mltcOptions={mltcOptions} />
      ))}

      {/* Download button to xlsx */}
      <AddButton />
    </div>
  )
}

export default MembersListPage
