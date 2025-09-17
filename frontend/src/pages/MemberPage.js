import React, { useState, useEffect, useCallback } from 'react';
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
import AddButton from '../components/buttons/AddButton';
import MemberHeader from '../components/layout/MemberHeader';

const MemberPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [memberData, setMemberData] = useState(null);
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
    if (!id) return;
    if (id === 'new') {
      setMemberData(null);
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
      <MemberHeader 
        navigate={navigate} 
        handleOpenAttendance={handleOpenAttendance} 
      />
      <div className="member content-padding">
        <div className="member-row">
          <MemberPhotoCard 
            photo={memberData?.photo}
            data={memberData?.info} 
          />
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

export default MemberPage;