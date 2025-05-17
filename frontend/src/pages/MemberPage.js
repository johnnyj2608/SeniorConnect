import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModalPage from './ModalPage';
import MemberDetailsCard from '../components/memberCards/MemberDetailsCard';
import MemberAuthCard from '../components/memberCards/MemberAuthCard';
import MemberContactsCard from '../components/memberCards/MemberContactsCard';
import MemberAbsencesCard from '../components/memberCards/MemberAbsencesCard';
import MemberFilesCard from '../components/memberCards/MemberFilesCard';
import MemberPhotoCard from '../components/memberCards/MemberPhotoCard';
import MemberStatusBanner from '../components/members/StatusBanner';

const MemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState(false);

  useEffect(() => {
    if (id === 'new') {
      setModalData({ id, type: 'basic', data: {} });
      setModalOpen(true);
    }
  }, [id])

  const handleDelete = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete this member?');
    if (isConfirmed) {
      const response = await fetch(`/core/members/${id}/`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        navigate('/members');
      }
    }
  };

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
  
  const handlePhotoUpdate = (newPhoto) => {
    setPhoto(newPhoto);
  };

  const handleStatusUpdate = (newStatus) => {
    setStatus(newStatus);
  };

  const handleModalOpen = (type, data, setData) => {
    setModalData({ id, type, data, setData });
    setModalOpen(true);
  };

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
        <h3><button className="delete-button" onClick={handleDelete}>Delete</button></h3>
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