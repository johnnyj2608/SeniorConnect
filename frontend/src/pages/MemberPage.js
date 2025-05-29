import React, {useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModalPage from './ModalPage';
import MemberDetailsCard from '../components/memberCards/MemberDetailsCard';
import MemberAuthCard from '../components/memberCards/MemberAuthCard';
import MemberContactsCard from '../components/memberCards/MemberContactsCard';
import MemberAbsencesCard from '../components/memberCards/MemberAbsencesCard';
import MemberFilesCard from '../components/memberCards/MemberFilesCard';
import MemberPhotoCard from '../components/memberCards/MemberPhotoCard';
import MemberStatusBanner from '../components/layout/StatusBanner';
import fetchWithRefresh from '../utils/fetchWithRefresh'

const MemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (id === 'new') {
      setModalData({ id, type: 'basic', data: {} });
      setModalOpen(true);
    }
  }, [id])

  const handleDelete = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete this member?');
    if (!isConfirmed) return;

    try {
      const response = await fetchWithRefresh(`/core/members/${id}/`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
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
      `Are you sure you want to ${status ? 'deactivate' : 'activate'} this member?`
    );
    if (!isConfirmed) return;

    try {
      const response = await fetchWithRefresh(`/core/members/${id}/`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.active);
      }
    } catch (error) {
      console.error('Failed to toggle status for member:', error);
    }
  }

  const handleCancel = (newId) => {
    if (newId || id !== 'new') {
      if (newId) {
        navigate(`/member/${newId}`);
      }
      setModalOpen(false);
    } else {
      navigate('/members');
    }
  };
  
  const handlePhotoUpdate = useCallback((newPhoto) => {
    setPhoto(newPhoto);
  }, []);
  
  const handleStatusUpdate = useCallback((newStatus) => {
    setStatus(newStatus);
  }, []);

  const handleModalOpen = useCallback((type, data, setData) => {
    setModalData({ id, type, data, setData });
    setModalOpen(true);
  }, [id]);

  return (
    <div className="member">
      <MemberStatusBanner status={status} />
      <div className="member-row">
        <MemberPhotoCard photo={photo} /> 
      </div>
      <div className="member-row">
        <MemberDetailsCard id={id}
          onEdit={handleModalOpen}
          onPhotoUpdate={handlePhotoUpdate}
          onStatusUpdate={handleStatusUpdate}
        />
        <MemberAuthCard
          id={id}
          onEdit={handleModalOpen}
        />
        <MemberContactsCard 
          id={id}
          onEdit={handleModalOpen}
        />
        <MemberAbsencesCard 
          id={id}
          onEdit={handleModalOpen}
        />
        <MemberFilesCard 
          id={id}
          onEdit={handleModalOpen}
        />
      </div>
      <div className="member-row">
      <button
        className={`action-button ${status ? 'caution' : ''}`}
        onClick={handleStatus}
      >
        {status ? 'Deactivate' : 'Activate'}
      </button>

        <button className="action-button destructive" onClick={handleDelete}>Delete</button>
      </div>
      {modalOpen && (
        <ModalPage
          data={modalData}
          onClose={handleCancel}
        />
      )}
    </div>
  )
}

export default MemberPage