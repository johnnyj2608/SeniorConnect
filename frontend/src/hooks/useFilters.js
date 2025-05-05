import { useState } from 'react';

const groupMembersByMltc = (members) => {
    return members.reduce((acc, member) => {
      const mltcName = member.mltc || "Unknown";
  
      if (!acc[mltcName]) {
        acc[mltcName] = [];
      }
      acc[mltcName].push(member);
      return acc;
    }, {});
};

const useFilters = (members, mltcOptions) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [mltcFilter, setMltcFilter] = useState('');
    const [showInactive, setShowInactive] = useState(false);

    // Filter logic
    const filteredMembers = members.filter((member) => {
        const matchesSearch =
        member.sadc_member_id.toString().startsWith(searchQuery) ||
        member.first_name.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
        member.last_name.toLowerCase().startsWith(searchQuery.toLowerCase());

        const matchesMltc = mltcFilter
        ? mltcFilter === member.mltc || (mltcFilter === 'Unknown' && member.mltc === null)
        : true;

        const matchesDisenrolled = showInactive ? true : member.active;

        return matchesSearch && matchesMltc && matchesDisenrolled;
    });

    const membersByMltc = groupMembersByMltc(filteredMembers, mltcOptions);

    return {
        searchQuery,
        setSearchQuery,
        mltcFilter,
        setMltcFilter,
        showInactive,
        setShowInactive,
        filteredMembers,
        membersByMltc,
    };
};

export default useFilters;
