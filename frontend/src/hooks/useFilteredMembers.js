import { useEffect, useState } from 'react';
import { normalizeField } from '../utils/formatUtils';

const useFilterMembers = ({ members, searchQuery, mltcFilter, showInactive }) => {
	const [filteredMembers, setFilteredMembers] = useState({});

	useEffect(() => {
		const normalizedQuery = normalizeField(searchQuery);

		const filtered = Object.entries(members).reduce((acc, [mltcName, memberList]) => {
			if (mltcFilter && mltcFilter !== mltcName) return acc;

			const matching = memberList.filter((member) => {
				if (!showInactive && member.inactive) return false;

				const fields = [
					member.sadc_member_id,
					member.first_name,
					member.last_name,
				].map((f) => normalizeField(f?.toString()));

				return normalizedQuery === '' || fields.some((f) => f.includes(normalizedQuery));
			});

			if (matching.length > 0) acc[mltcName] = matching;
			return acc;
		}, {});

		setFilteredMembers(filtered);
	}, [members, searchQuery, mltcFilter, showInactive]);

	const totalFiltered = Object.values(filteredMembers).flat().length;

	return { filteredMembers, totalFiltered };
};

export default useFilterMembers;