import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import ModalPage from './ModalPage';
import useModalOpen from '../hooks/useModalOpen';
import MemberInfoCard from '../components/cards/MemberInfoCard';
import MemberAuthCard from '../components/cards/MemberAuthCard';
import MemberContactsCard from '../components/cards/MemberContactsCard';
import MemberAbsencesCard from '../components/cards/MemberAbsencesCard';
import MemberFilesCard from '../components/cards/MemberFilesCard';
import MemberGiftedCard from '../components/cards/MemberGiftedCard';
import MemberPhotoCard from '../components/cards/MemberPhotoCard';
import MemberStatusBanner from '../components/layout/StatusBanner';
import fetchWithRefresh from '../utils/fetchWithRefresh';

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

  useEffect(() => {
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

  const handleDelete = async () => {
    if (!memberData) return;

    const action = t('general.buttons.delete');
    const isConfirmed = window.confirm(t('member.confirm_update', { action: action.toLowerCase() }));
    if (!isConfirmed) return;

    try {
      const response = await fetchWithRefresh(`/core/members/${id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        navigate('/members');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatus = async () => {
    if (!memberData) return;

    const action = memberData?.member?.status
      ? t('general.buttons.deactivate')
      : t('general.buttons.activate');

    const isConfirmed = window.confirm(t('member.confirm_update', { action: action.toLowerCase() }));
    if (!isConfirmed) return;

    try {
      const response = await fetchWithRefresh(`/core/members/${id}/status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const updated = await response.json();
        setMemberData(prev => ({
          ...prev,
          info: { ...prev.info, active: updated.active },
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = useCallback(
    (newId) => {
      if (newId || id !== 'new') {
        if (newId) navigate(`/member/${newId}`);
        closeModal();
      } else {
        navigate('/members');
      }
    },
    [closeModal, id, navigate]
  );

  const handleModalOpen = useCallback(
    (type, data) => {
      openModal(type, { id, data, setData: setMemberData });
    },
    [id, openModal]
  );

  return (
    <div className="member content-padding">
      <MemberStatusBanner status={memberData?.info?.active} />
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
            <MemberGiftedCard id={id} onEdit={handleModalOpen} />
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

      {modalOpen && <ModalPage data={modalData} onClose={handleCancel} />}
    </div>
  );
};

export default MemberPage;