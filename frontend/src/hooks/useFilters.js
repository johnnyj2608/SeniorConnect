import { useState } from 'react';

const useFilters = (groupedMltcs) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mltcFilter, setMltcFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const filteredMembers = groupedMltcs.filter((mltc) => {
    const matchesMltc = mltcFilter ? mltcFilter === mltc.name : true;

    if (!matchesMltc) return false;

    const matchesSearch = mltc.member_list.some((member) => {
      return (
        member.sadc_member_id?.toString().startsWith(searchQuery) ||
        member.first_name?.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
        member.last_name?.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    });

    const matchesActive = showInactive
      ? true
      : mltc.member_list.some((member) => member.active);

    return matchesSearch && matchesActive;
  });

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