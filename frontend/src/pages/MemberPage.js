import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModalPage from './ModalPage';
import MemberInfoCard from '../components/memberCards/MemberInfoCard';
import MemberAuthCard from '../components/memberCards/MemberAuthCard';
import MemberContactsCard from '../components/memberCards/MemberContactsCard';
import MemberAbsencesCard from '../components/memberCards/MemberAbsencesCard';
import MemberFilesCard from '../components/memberCards/MemberFilesCard';
import MemberPhotoCard from '../components/memberCards/MemberPhotoCard';
import MemberStatusBanner from '../components/layout/StatusBanner';
import fetchWithRefresh from '../utils/fetchWithRefresh';

const MemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [memberData, setMemberData] = useState(null);

  useEffect(() => {
    if (id === 'new') {
      setModalData({ id, type: 'info', data: {} });
      setModalOpen(true);
    } else {
      const fetchMemberData = async () => {
        try {
          const response = await fetchWithRefresh(`/core/members/${id}/full/`);
          if (!response.ok) return;
          const data = await response.json();
          setMemberData(data);
        } catch (error) {
          console.error('Failed to fetch member data:', error);
        }
      };

      fetchMemberData();
    }
  }, [id]);

  const handleDelete = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete this member?');
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
      console.error('Failed to delete member:', error);
    }
  };

  const handleStatus = async () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to ${memberData.member.status ? 'deactivate' : 'activate'} this member?`
    );
    if (!isConfirmed) return;

    try {
      const response = await fetchWithRefresh(`/core/members/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const updated = await response.json();
        setMemberData(prev => ({
          ...prev,
          member: { ...prev.member, status: updated.active },
        }));
      }
    } catch (error) {
      console.error('Failed to toggle status for member:', error);
    }
  };

  const handleCancel = (newId) => {
    if (newId || id !== 'new') {
      if (newId) navigate(`/member/${newId}`);
      setModalOpen(false);
    } else {
      navigate('/members');
    }
  };

  const handleModalOpen = useCallback((type, data) => {
    setModalData({ id, type, data, setData: setMemberData }); 
    setModalOpen(true);
  }, [id]);

  return (
    <div className="member content-padding">
      <MemberStatusBanner status={memberData?.info?.active} />
      <div className="member-row">
        <MemberPhotoCard data={memberData?.info} />
      </div>
      <div className="member-row">
        <MemberInfoCard data={memberData?.info} onEdit={handleModalOpen} />
        <MemberAuthCard id={id} data={memberData?.auth} onEdit={handleModalOpen} />
        <MemberContactsCard data={memberData?.contacts} onEdit={handleModalOpen} />
        <MemberAbsencesCard data={memberData?.absences} onEdit={handleModalOpen} />
        <MemberFilesCard data={memberData?.files} onEdit={handleModalOpen} />
      </div>
      <div className="member-row">
        <button className="action-button" onClick={handleStatus}>
          {memberData?.info?.active ? 'Deactivate' : 'Activate'}
        </button>
        <button className="action-button destructive" onClick={handleDelete}>
          Delete
        </button>
      </div>
      {modalOpen && (
        <ModalPage data={modalData} onClose={handleCancel} />
      )}
    </div>
  );
};

export default MemberPage;