import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModalPage from './ModalPage';
import { ReactComponent as Arrowleft } from '../assets/arrow-left.svg'
import MemberDetailsCard from '../components/memberCardTemplates/MemberDetailsCard';
import MemberAuthCard from '../components/memberCardTemplates/MemberAuthCard';
import MemberContactsCard from '../components/memberCardTemplates/MemberContactsCard';
import MemberAbsencesCard from '../components/memberCardTemplates/MemberAbsencesCard';
import MemberFilesCard from '../components/memberCardTemplates/MemberFilesCard';
import MemberPhotoCard from '../components/memberCardTemplates/MemberPhotoCard';


const MemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (id === 'new') {
      setModalData({ id, type: 'basic', data: {} });
      setModalOpen(true);
    }
  }, [id])

  const handleBack = () => {
    navigate('/members')
  };

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
        handleBack();
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

  const handleModalOpen = (type, data, setData) => {
    setModalData({ id, type, data, setData });
    setModalOpen(true);
  };

  return (
    <div className="member">
      <div className="member-header">
        <h3>
          <Arrowleft onClick={handleBack} />
        </h3>
      </div>
      <div className="member-row">
        <MemberPhotoCard
          photo={photo}
        /> 
      </div>
      <div className="member-row">
        <MemberDetailsCard
          id={id}
          onEdit={handleModalOpen}
          onPhotoUpdate={handlePhotoUpdate}
        />
        <MemberAuthCard
          id={id}
          onEdit={handleModalOpen}
        />
      </div>
      <div className="member-row">
        <MemberContactsCard 
          contacts={{}}
          onEdit={() => handleModalOpen('contacts')}
        />
        <MemberAbsencesCard 
          absences={{}}
          onEdit={() => handleModalOpen('absences')}
        />
      </div>
      <div className="member-row">
        <MemberFilesCard 
          files={{}}
          onEdit={() => handleModalOpen('files')}
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