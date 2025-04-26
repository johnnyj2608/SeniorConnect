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
    const [sortOption, setSortOption] = useState('');
    const [scheduleFilter, setScheduleFilter] = useState([
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ]);
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

        const matchesSchedule =
        scheduleFilter.length === 7
            ? true
            : member.schedule?.some((day) => scheduleFilter.includes(day));

        const matchesDisenrolled = showInactive ? true : member.active;

        return matchesSearch && matchesMltc && matchesSchedule && matchesDisenrolled;
    });

    // Sorting logic
    const sortMembers = (members) => {
        switch (sortOption) {
        case 'Member ID (0-9)':
            return [...members].sort((a, b) => a.sadc_member_id - b.sadc_member_id);
        case 'Member ID (9-0)':
            return [...members].sort((a, b) => b.sadc_member_id - a.sadc_member_id);
        case 'Last Name (A-Z)':
            return [...members].sort((a, b) => a.last_name.localeCompare(b.last_name));
        case 'Last Name (Z-A)':
            return [...members].sort((a, b) => b.last_name.localeCompare(a.last_name));
        case 'First Name (A-Z)':
            return [...members].sort((a, b) => a.first_name.localeCompare(b.first_name));
        case 'First Name (Z-A)':
            return [...members].sort((a, b) => b.first_name.localeCompare(a.first_name));
        default:
            return members;
        }
    };

    const sortedMembers = sortMembers(filteredMembers);
    const membersByMltc = groupMembersByMltc(sortedMembers, mltcOptions);

    return {
        searchQuery,
        setSearchQuery,
        mltcFilter,
        setMltcFilter,
        sortOption,
        setSortOption,
        scheduleFilter,
        setScheduleFilter,
        showInactive,
        setShowInactive,
        sortedMembers,
        membersByMltc,
    };
};

export default useFilters;
