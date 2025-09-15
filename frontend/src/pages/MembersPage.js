import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import ModalPage from './ModalPage';
import useModalOpen from '../hooks/useModalOpen';
import useMembers from '../hooks/useMembers';
import MemberInfoCard from '../components/cards/MemberInfoCard';
import MemberAuthCard from '../components/cards/MemberAuthCard';
import MemberContactsCard from '../components/cards/MemberContactsCard';
import MemberAbsencesCard from '../components/cards/MemberAbsencesCard';
import MemberFilesCard from '../components/cards/MemberFilesCard';
import MemberGiftedCard from '../components/cards/MemberGiftedCard';
import MemberPhotoCard from '../components/cards/MemberPhotoCard';
import fetchWithRefresh from '../utils/fetchWithRefresh';
import SearchMembers from '../components/inputs/SearchMembers';
import Switch from 'react-switch';
import AddButton from '../components/buttons/AddButton';
import AttendanceButton from '../components/buttons/AttendanceButton';
import { MltcContext } from '../context/MltcContext';

const MembersPage = () => {
  const { t } = useTranslation();
  const { mltcs, refreshMltc } = useContext(MltcContext)
  const { id } = useParams();
  const navigate = useNavigate();

  const [memberData, setMemberData] = useState(null);
  const [mltcFilter, setMltcFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const {
    modalOpen,
    modalData,
    openModal,
    closeModal,
  } = useModalOpen();

  const { 
    handleDelete, 
    handleStatus 
  } = useMembers(id, setMemberData);

	useEffect(() => {
		refreshMltc();
	}, [refreshMltc]);

  useEffect(() => {
    if (!id) return;
    if (id === 'new') {
      openModal('info', { id, data: {}, setData: setMemberData });
    } else {
      const fetchMemberData = async () => {
        try {
          const response = await fetchWithRefresh(`/core/members/${id}/profile/`);
          if (!response.ok) return;
          const data = await response.json();
          setMemberData(data);
        } catch (error) {
          console.error(error);
        }
      };

      fetchMemberData();
    }
  }, [id, openModal]);

  const handleCancel = useCallback(
    (newId) => {
      if (newId || id !== 'new') {
        if (newId) navigate(`/members/${newId}`);
      } else {
        navigate('/members');
      }
      closeModal();
    },
    [closeModal, id, navigate]
  );

  const handleModalOpen = useCallback(
    (type, data) => {
      openModal(type, { id, data, setData: setMemberData });
    },
    [id, openModal]
  );

  const handleOpenAttendance = async () => {
    try {
      const response = await fetchWithRefresh('/core/members/attendance');
      if (!response.ok) return;
      const data = await response.json();

      openModal('attendance', { data });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title-row">
					<h2 className="page-title">&#9782; {t('general.members')}</h2>
					<AttendanceButton 
            onClick={handleOpenAttendance} 
          />
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
								{mltcs.map((option) => (
									<option key={option.name} value={option.name}>
										{option.name}
									</option>
								))}
								<option value="unknown">{t('members.unknown')}</option>
							</select>
						</div>

						<div className="filter-option">
							<label>{t('members.search_members')}</label>
							<SearchMembers
                value={searchQuery}
                onChange={setSearchQuery}
                onSelect={(member) => {
                  setSearchQuery(''); 
                  navigate(`/members/${member.id}`);
                }}
                showInactive={showInactive}
                mltcFilter={mltcFilter}
              />
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
        </div>
      </div>

      <div className="member content-padding">
        <div className="member-row">
          <MemberPhotoCard data={memberData?.info} />
        </div>
        {memberData && (
          <>
            <div className="member-row">
              <MemberInfoCard data={memberData.info} onEdit={handleModalOpen} />
              <MemberAuthCard id={id} data={memberData.auth} onEdit={handleModalOpen} />
            </div>
            <div className="member-row">
              <MemberContactsCard data={memberData.contacts} onEdit={handleModalOpen} />
              <MemberAbsencesCard data={memberData.absences} onEdit={handleModalOpen} />
              <MemberGiftedCard id={id} data={memberData.gifts} onEdit={handleModalOpen} />
            </div>
            <div className="member-row">
              <MemberFilesCard data={memberData.files} onEdit={handleModalOpen} />
            </div>
            <div className="member-row">
              <button className="action-button" onClick={handleStatus}>
                {memberData.info.active
                  ? t('general.buttons.deactivate')
                  : t('general.buttons.activate')}
              </button>
              <button className="action-button destructive" onClick={handleDelete}>
                {t('general.buttons.delete')}
              </button>
            </div>
          </>
        )}

        <AddButton />
        {modalOpen && <ModalPage data={modalData} onClose={handleCancel} />}
      </div>
    </>
    
  );
};

export default MembersPage;