import React, { useState, useEffect, useCallback } from 'react';
import ListItem from '../components/items/ListItem';
import AddButton from '../components/buttons/AddButton';
import DownloadButton from '../components/buttons/DownloadButton';
import SearchInput from '../components/inputs/SearchInput';
import Switch from 'react-switch';
import { useLocation } from 'react-router-dom';
import fetchWithRefresh from '../utils/fetchWithRefresh';
import useFilteredMembers from '../hooks/useFilteredMembers';

const MembersListPage = () => {
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const mltcQueryParam = queryParams.get('mltc');

	const [members, setMembers] = useState({});
	const [mltcOptions, setMltcOptions] = useState([]);
	const [mltcFilter, setMltcFilter] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [showInactive, setShowInactive] = useState(false);

	// Wrap getMembers in useCallback
	const getMembers = useCallback(async () => {
		const params = new URLSearchParams();
		if (mltcFilter) params.append('filter', mltcFilter);
		if (showInactive) params.append('show_inactive', 'true');

		try {
			const response = await fetchWithRefresh(`/core/members?${params.toString()}`);
			if (response.ok) {
				const data = await response.json();
				setMembers(data);
			}
		} catch (error) {
			console.error(error);
		}
	}, [mltcFilter, showInactive]);

	const getMltcOptions = useCallback(async () => {
		try {
			const response = await fetchWithRefresh('/core/mltcs/');
			if (!response.ok) throw new Error('Failed to fetch MLTC options');
			const data = await response.json();
			setMltcOptions(data);
		} catch (error) {
			console.error(error);
		}
	}, []);

	useEffect(() => {
		getMltcOptions();
		getMembers();
	}, [getMltcOptions, getMembers]);

	useEffect(() => {
		getMembers();
	}, [getMembers]);

	useEffect(() => {
		if (mltcQueryParam && mltcFilter !== mltcQueryParam) {
			setMltcFilter(mltcQueryParam);
		}
	}, [mltcQueryParam, mltcFilter]);

	const { filteredMembers, totalFiltered } = useFilteredMembers({ members, searchQuery });

	return (
		<>
			<div className="page-header">
				<div className="page-title-row">
					<h2 className="page-title">&#9782; Members</h2>
					<DownloadButton members={members} />
				</div>

				<div className="filter-row">
					<div className="filter-content">
						<div className="filter-option">
							<label>MLTC Filter</label>
							<select 
								required 
								value={mltcFilter} 
								onChange={(e) => setMltcFilter(e.target.value)}
							>
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
							<label>Search Members</label>
							<SearchInput value={searchQuery} onChange={setSearchQuery} />
						</div>

						<div className="filter-option">
							<label>Inactive</label>
							<div className="switch-container">
								<Switch
									checked={showInactive}
									onChange={() => setShowInactive(!showInactive)}
									onColor="#6366F1"
								/>
							</div>
						</div>
					</div>

					<p className="members-count">
						{totalFiltered} {totalFiltered === 1 ? 'result' : 'results'}
					</p>
				</div>
			</div>

			<div className="members-list-content content-padding">
				{Object.entries(filteredMembers).map(([mltcName, memberList]) => (
					<div key={mltcName}>
						<h3 className="section-title">{mltcName}</h3>
						<div className="members-list">
							{memberList.map((member) => (
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