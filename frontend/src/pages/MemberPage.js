import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemberModal from '../components/MemberModal';
import { formatDate, formatPhone, formatGender } from '../utils/formatUtils';
import urlToFile from '../utils/urlToFile';
import { ReactComponent as Arrowleft } from '../assets/arrow-left.svg'
import { ReactComponent as Pencil } from '../assets/pencil.svg'
import { ReactComponent as AddButton } from '../assets/add.svg'

const MemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState({});
  const [authorizations, setAuthorizations] = useState([])
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  const getMember = async () => {
    if (id === 'new') return

    const response = await fetch(`/core/members/${id}/`)
    const data = await response.json()

    const sanitizedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value ?? ""])
    );

    setMember(sanitizedData)
    // getAuthorizations(sanitizedData.id);
  }

  const getAuthorizations = async () => {
    if (id === 'new') return

    const response = await fetch(`/core/authorizations/${id}`);
    const data = await response.json();
    setAuthorizations(data);
  };

  useEffect(() => {
    if (id === 'new') {
      setModalOpen(true);
      setModalType('details');
    } else {
      getMember();
    }
    // eslint-disable-next-line
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

  const handleSave = async (updatedMember) => {
    const requiredFields = ['sadc_member_id', 'first_name', 'last_name', 'birth_date', 'gender', 'phone', 'medicaid'];
    const missingFields = requiredFields.filter(field => !updatedMember[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(", ")}`);
      return;
    }

    const formData = new FormData();
    for (const key in updatedMember) {
      if (key === 'photo' && typeof updatedMember.photo === 'string') {
        const file = await urlToFile(updatedMember.photo, `${id}.jpg`);
        formData.append('photo', file);
      } else {
        formData.append(key, updatedMember[key]);
      }
    }

    let response;
    if (id === 'new') {
      response = await fetch(`/core/members/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const savedMember = await response.json();
        setModalOpen(false); 
        navigate(`/member/${savedMember.id}`);
      }
    } else {
      response = await fetch(`/core/members/${id}/`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setMember(updatedMember);
        setModalOpen(false);
      }
    }
  };

  const handleCancel = () => {
    if (id === 'new') {
      navigate('/members');
    } else {
      setModalOpen(false);
    }
  };

  const handleModalOpen = (type) => {
    setModalType(type);
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
        <img 
            src={member.photo instanceof File ? URL.createObjectURL(member.photo) : member.photo || "/default-profile.jpg"} 
            alt="Member Photo" 
            className="member-photo"
            onClick={() => handleModalOpen('photo')}
            onError={(e) => e.target.src = "/default-profile.jpg"}
        />
      </div>
      <div className="member-row">
        <div className="member-half-card">
          <h2>Details</h2>
          <div className="member-container">
            <Pencil className="edit-icon" onClick={() => handleModalOpen('details')} />
            <div className="member-detail">
              <label>Member ID:</label>
              <span>{member.sadc_member_id || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Last Name:</label>
              <span>{member.last_name || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>First Name:</label>
              <span>{member.first_name || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Birth Date:</label>
              <span>{formatDate(member.birth_date) || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Gender: </label>
              <span>{formatGender(member.gender) || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Phone:</label>
              <span>{member.phone ? formatPhone(member.phone) : 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Address:</label>
              <span>{member.address || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Email:</label>
              <span>{member.email || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Medicaid:</label>
              <span>{member.medicaid || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="member-half-card">
          <h2>Authorization</h2>
          <div className="member-container">
            <AddButton className="edit-icon" onClick={() => handleModalOpen('authorization')} />
            <div className="member-detail">
              <label>Member ID:</label>
            </div>
            <div className="member-detail">
              <label>MLTC:</label>
            </div>
            <div className="member-detail">
              <label>Auth ID:</label>
            </div>
            <div className="member-detail">
              <label>Diagnosis:</label>
            </div>
            <div className="member-detail">
              <label>Schedule:</label>
            </div>
            <div className="member-detail">
              <label>Start Date:</label>
            </div>
            <div className="member-detail">
              <label>End Date:</label>
            </div>
            <div className="member-detail">
              <label>Transportation:</label>
            </div>
            {/* If updating auth, prefill with previous info except dates */}
          </div>
        </div>
      </div>
      <div className="member-row">
        <div className="member-half-card">
          <h2>Contacts</h2>
          <div className="member-container">
            <Pencil className="edit-icon" onClick={() => handleModalOpen('contacts')} />
            <div className="member-detail">
              <label>Emergency Contact:</label>
            </div>
            <div className="member-detail">
              <label>Primary Care Provider:</label>
            </div>
            <div className="member-detail">
              <label>Pharmacy:</label>
            </div>
            <div className="member-detail">
              <label>Spouse:</label>
            </div>
          </div>
        </div>
        <div className="member-half-card">
          <h2>Absences</h2>
          <div className="member-container">
            <AddButton className="edit-icon" onClick={() => handleModalOpen('absences')} />
          </div>
        </div>
      </div>
      <div className="member-row">
        <div className="member-full-card">
          <h2>Files</h2>
          <div className="member-container">
            <AddButton className="edit-icon" onClick={() => handleModalOpen('files')} />
            {/* Upload and nickname file */}
            {/* Dispalyed as a gallery of files */}
            {/* Click to open new tab for PDF */}
          </div>
        </div>
      </div>
      <div className="member-row">
        <h3><button className="delete-button" onClick={handleDelete}>Delete</button></h3>
      </div>
      {modalOpen && (
        <MemberModal
          data={member}
          onClose={handleCancel}
          onSave={handleSave}
          type={modalType}
        />
      )}
    </div>
  )
}

export default MemberPage
