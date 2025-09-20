import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import ModalPage from './ModalPage';
import useModalOpen from '../hooks/useModalOpen';
import useMembers from '../hooks/useMembers';
import MemberInfoCard from '../components/cards/MemberInfoCard';
import MemberAuthCard from '../components/cards/MemberAuthCard';
import MemberContactCard from '../components/cards/MemberContactCard';
import MemberAbsenceCard from '../components/cards/MemberAbsenceCard';
import MemberFileCard from '../components/cards/MemberFileCard';
import MemberGiftedCard from '../components/cards/MemberGiftedCard';
import MemberPhotoCard from '../components/cards/MemberPhotoCard';
import fetchWithRefresh from '../utils/fetchWithRefresh';
import AddButton from '../components/buttons/AddButton';
import MemberHeader from '../components/layout/MemberHeader';

const MemberPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const {
    modalOpen,
    modalData,
    openModal,
    closeModal,
  } = useModalOpen();

  const { 
    handleDelete, 
    handleStatus 
  } = useMembers(id, setMember);

  useEffect(() => {
    if (!id) return;
    if (id === 'new') {
      setMember(null);
      openModal({
          id,
          type: 'info',
          setData: setMember,
          data: {},
      });
    } else {
      const fetchMemberData = async () => {
        try {
          const response = await fetchWithRefresh(`/core/members/${id}/profile/`);
          if (!response.ok) return;
          const data = await response.json();
          setMember(data);
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
    (type, options = {}) => {
      openModal({
        id,
        type,
        setData: setMember,
        data: options.data,
        fetchData: options.fetchData,
      });
    },
    [id, openModal]
  );

  const handleOpenAttendance = () => {
    openModal({
      type: 'attendance',
      fetchData: async () => {
        const response = await fetchWithRefresh('/core/members/attendance');
        if (!response.ok) throw new Error('Failed fetch');
        return await response.json();
      }
    });
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
            photo={member?.photo}
            data={member?.info} 
          />
        </div>
        {member && (
          <>
            <div className="member-row">
              <MemberInfoCard data={member.info} onEdit={handleModalOpen} />
              <MemberAuthCard id={id} data={member.auth} onEdit={handleModalOpen} />
            </div>
            <div className="member-row">
              <MemberContactCard data={member.contacts} onEdit={handleModalOpen} />
              <MemberAbsenceCard data={member.absences} onEdit={handleModalOpen} />
              <MemberGiftedCard id={id} data={member.gifts} onEdit={handleModalOpen} />
            </div>
            <div className="member-row">
              <MemberFileCard data={member.files} onEdit={handleModalOpen} />
            </div>
            <div className="member-row">
              <button className="action-button" onClick={handleStatus}>
                {member.info.active
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