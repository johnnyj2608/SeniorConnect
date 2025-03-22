import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactComponent as Arrowleft } from '../assets/arrow-left.svg'
import { ReactComponent as Pencil } from '../assets/pencil.svg'

const MemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState({
    sadc_member_id: '',
    mltc: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
    address: '',
    phone: '',
    email: '',
    medicaid: '',
    care_manager: '',
    primary_care_provider: '',
    pharmacy: '',
    spouse: '',
  });

  const [editing, setEditing] = useState(false);

  const handleBack = () => {
    navigate('/members')
  };

  const handleEdit = () => {
    setEditing(true);
    console.log('editing')
  };

  const handleCancel = () => {
    setEditing(false);
    setMember(member);
    console.log('cancel')
  };

  const handleSave = () => {
    setEditing(false);
    console.log('saving')
  };

  const handleDelete = () => {
    setEditing(false);
    handleBack();
  };

  return (
    <div className="member">
      <div className="member-header">
        <h3>
          {editing ? (
            <button onClick={handleCancel}>Cancel</button>
          ) : (
            <Arrowleft onClick={handleBack} />
          )}
        </h3>
        <h3>
          {editing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <Pencil onClick={handleEdit} />
          )}
        </h3>
      </div>
      <div className="member-main">
        <div className="info-card">
            {/* Photo */}
            {/* SADC Member ID. Last Name, First Name (Adjacent to photo) */}
            {/* Birth Date */}
            {/* Gender */}
            {/* Phone */}
            {/* Address */}
            {/* Email */}
            {/* Medicaid */}
            {/* Note */}
        </div>
        <div className="auth-card">
            {/* MLTC */}
            {/* Auth ID */}
            {/* Member ID */}
            {/* Diagnosis */}
            {/* Days of Service */}
            {/* Start / End Date */}
            {/* Transportation */}
            {/* Care Manager */}
            {/* If updating auth, prefill with previous info except dates */}
        </div>
      </div>
      <div className="member-secondary">
        <div className="contacts-card">
            {/* Primary Care Provider */}
            {/* Pharmacy */}
            {/* Spouse */}
        </div>
        <div className="absences-card">
            {/* Upcoming absences */}
            {/* Click plus button to add range */}
        </div>
      </div>
      <div className="files-card">
        {/* Upload and nickname file */}
        {/* Dispalyed as a gallery of files */}
        {/* Click to open new tab for PDF */}
      </div>
      {/* Delete Member Button */}
    </div>
  )
}

export default MemberPage
