import { useState } from 'react';

const useFilters = (groupedMltcs) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mltcFilter, setMltcFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const filteredMltcs = groupedMltcs.map((mltc) => {
    const matchesMltc = mltcFilter ? mltcFilter === mltc.name : true;

    if (!matchesMltc) return { ...mltc, member_list: [] };

    const filteredMembers = mltc.member_list.filter((member) => {
      const matchesSearch = 
        member.sadc_member_id?.toString().includes(searchQuery) ||
        member.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.last_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesActive = showInactive ? true : member.active;

      return matchesSearch && matchesActive;
    });

    return { ...mltc, member_list: filteredMembers };
  });

  const filteredMembers = filteredMltcs.filter(mltc => mltc.member_list.length > 0);

  return {
    searchQuery,
    setSearchQuery,
    mltcFilter,
    setMltcFilter,
    showInactive,
    setShowInactive,
    filteredMembers,
  };
};

export default useFilters;