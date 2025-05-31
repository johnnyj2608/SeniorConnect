import { useEffect, useState } from 'react';

const useFilterMembers = ({ members, searchQuery }) => {
	const [filteredMembers, setFilteredMembers] = useState({});

	useEffect(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		const filtered = Object.entries(members).reduce((acc, [mltcName, memberList]) => {
			const matching = memberList.filter((member) => {
				const fields = [
					member.sadc_member_id,
					member.first_name,
					member.last_name,
				].map((f) => (f || '').toString().toLowerCase());

				return normalizedQuery === '' || fields.some((f) => f.includes(normalizedQuery));
			});

			if (matching.length > 0) acc[mltcName] = matching;
			return acc;
		}, {});

		setFilteredMembers(filtered);
	}, [members, searchQuery]);

	const totalFiltered = Object.values(filteredMembers).flat().length;

	return { filteredMembers, totalFiltered };
};

export default useFilterMembers;