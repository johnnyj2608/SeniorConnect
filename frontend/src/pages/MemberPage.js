import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemberModal from '../components/MemberModal';
import { ReactComponent as Arrowleft } from '../assets/arrow-left.svg'
import { ReactComponent as Pencil } from '../assets/pencil.svg'
import { ReactComponent as AddButton } from '../assets/add.svg'

const MemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  const getMember = async () => {
    if (id === 'new') return

    const response = await fetch(`/core/members/${id}/`)
    const data = await response.json()

    const sanitizedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value ?? ""])
    );

    setMember(sanitizedData)
  }

  useEffect(() => {
    getMember()
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
    const response = await fetch(`/core/members/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedMember),
    });

    if (response.ok) {
      setMember(updatedMember);
      setModalOpen(false);
    }
  };

  return (
    <div className="member">
      <div className="member-header">
        <h3>
          <Arrowleft onClick={handleBack} />
        </h3>
      </div>
      <div className="member-row">
        <div className="member-half-card">
          <Pencil className="edit-icon" onClick={() => setModalOpen(true)} />
          {/* Member Photo */}
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
            <span>{member.birth_date || 'N/A'}</span>
          </div>

          <div className="member-detail">
            <label>Gender: </label>
            <span>{member.gender || 'N/A'}</span>
          </div>

          <div className="member-detail">
            <label>Phone:</label>
            <span>{member.phone || 'N/A'}</span>
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
        <div className="member-half-card">
          <AddButton className="edit-icon" onClick={handleBack} />
          <label>MLTC:</label>
          <label>Member ID:</label>
          <label>Auth ID:</label>
          <label>Diagnosis:</label>
          <label>Schedule:</label>
          <label>Start Date:</label>
          <label>End Date:</label>
          <label>Transportation:</label>
          <label>CM Name:</label>
          <label>CM Phone:</label>
          {/* If updating auth, prefill with previous info except dates */}
        </div>
      </div>
      <div className="member-row">
        <div className="member-half-card">
          <Pencil className="edit-icon" onClick={handleBack} />
          <label>Emergency Contact:</label>
          <label>Primary Care Provider:</label>
          <label>Pharmacy:</label>
          <label>Spouse:</label>
        </div>
        <div className="member-half-card">
          <AddButton className="edit-icon" onClick={handleBack} />
        </div>
      </div>
      <div className="member-row">
        <div className="member-full-card">
          <AddButton className="edit-icon" onClick={handleBack} />
          {/* Upload and nickname file */}
          {/* Dispalyed as a gallery of files */}
          {/* Click to open new tab for PDF */}
        </div>
      </div>
      <div className="member-row">
        <h3><button className="delete-button" onClick={handleDelete}>Delete</button></h3>
      </div>
      {modalOpen && (
        <MemberModal
          member={member}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

export default MemberPage
