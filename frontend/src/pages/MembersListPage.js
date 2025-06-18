import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next'
import ModalPage from './ModalPage';
import useModalOpen from '../hooks/useModalOpen';
import ListItem from '../components/items/ListItem';
import AddButton from '../components/buttons/AddButton';
import AttendanceButton from '../components/buttons/AttendanceButton';
import SearchInput from '../components/inputs/SearchInput';
import Switch from 'react-switch';
import { useLocation } from 'react-router-dom';
import fetchWithRefresh from '../utils/fetchWithRefresh';
import useFilteredMembers from '../hooks/useFilteredMembers';

const MembersListPage = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const mltcQueryParam = queryParams.get('mltc');

	const [members, setMembers] = useState({});
	const [mltcOptions, setMltcOptions] = useState([]);
	const [mltcFilter, setMltcFilter] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [showInactive, setShowInactive] = useState(false);

	const {
		modalOpen,
		modalData,
		openModal,
		closeModal
	  } = useModalOpen();

	const getMembers = useCallback(async () => {
		try {
			const response = await fetchWithRefresh('/core/members/');
			if (response.ok) {
				const data = await response.json();
				setMembers(data);
			}
		} catch (error) {
			console.error(error);
		}
	}, []);

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
	}, [getMembers, getMltcOptions]);

	useEffect(() => {
		if (mltcQueryParam && mltcFilter !== mltcQueryParam) {
			setMltcFilter(mltcQueryParam);
		}
	}, [mltcQueryParam, mltcFilter]);

	const { filteredMembers, totalFiltered } = useFilteredMembers({
		members,
		searchQuery,
		showInactive,
		mltcFilter,
	});

	return (
		<>
			<div className="page-header">
				<div className="page-title-row">
					<h2 className="page-title">&#9782; {t('general.members')}</h2>
					<AttendanceButton onClick={() => openModal('attendance', {data: members })} />
				</div>

				<div className="filter-row">
					<div className="filter-content">
						<div className="filter-option">
							<label>{t('members.mltc_filter')}</label>
							<select 
								required 
								value={mltcFilter} 
								onChange={(e) => setMltcFilter(e.target.value)}
							>
								<option value="">{t('general.select_an_option')}</option>
								{mltcOptions.map((option) => (
									<option key={option.name} value={option.name}>
										{option.name}
									</option>
								))}
								<option value="unknown">{t('members.unknown')}</option>
							</select>
						</div>

						<div className="filter-option">
							<label>{t('members.search_members')}</label>
							<SearchInput value={searchQuery} onChange={setSearchQuery} />
						</div>

						<div className="filter-option">
							<label>{t('members.inactive')}</label>
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
						{totalFiltered} {totalFiltered === 1 ? t('general.result') : t('general.results')}
					</p>
				</div>
			</div>

			<div className="members-list-content content-padding">
				{Object.entries(filteredMembers).map(([mltcName, memberList]) => (
					<div key={mltcName}>
						<h3 className="section-title">
							{mltcName === 'unknown' ? t('members.unknown') : mltcName}
						</h3>
						<div className="members-list">
							{memberList.map((member) => (
								<ListItem key={member.id} member={member} />
							))}
						</div>
					</div>
				))}
			</div>

			<AddButton />
			{modalOpen && <ModalPage data={modalData} onClose={closeModal} />}
		</>
	);
};

export default MembersListPage;