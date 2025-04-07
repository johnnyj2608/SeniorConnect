import React, { useState, useEffect } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import { formatDate, formatGender, formatPhone, formatSSN } from '../../utils/formatUtils';

const MemberDetailsCard = ({ id, onEdit, onPhotoUpdate }) => {
  const [member, setMember] = useState(null);

  const getMember = async () => {
    const response = await fetch(`/core/members/${id}/`);
    const data = await response.json();
    setMember(data);
    onPhotoUpdate(data.photo);
  };

  useEffect(() => {
    if (id !== 'new') {
      getMember();
    }
  }, [id]);

  useEffect(() => {
    onPhotoUpdate(member?.photo);
  }, [member]);

  const handleEdit = () => {
    if (member) {
      onEdit('basic', member, setMember);
    }
  };
  
  return (
    <div className="member-half-card">
      <h2>Details</h2>
      <div className="member-container">
        <Pencil className="edit-icon" onClick={handleEdit} />
        
        <div className="member-detail">
          <label>Member ID:</label>
          <span>{member?.sadc_member_id || 'N/A'}</span>
        </div>

        <div className="member-detail">
          <label>Last Name:</label>
          <span>{member?.last_name || 'N/A'}</span>
        </div>

        <div className="member-detail">
          <label>First Name:</label>
          <span>{member?.first_name || 'N/A'}</span>
        </div>

        <div className="member-detail">
          <label>Birth Date:</label>
          <span>{formatDate(member?.birth_date) || 'N/A'}</span>
        </div>

        <div className="member-detail">
          <label>Gender: </label>
          <span>{formatGender(member?.gender) || 'N/A'}</span>
        </div>

        <div className="member-detail">
          <label>Phone:</label>
          <span>{formatPhone(member?.phone) || 'N/A'}</span>
        </div>

        <div className="member-detail">
          <label>Address:</label>
          <span>{member?.address || 'N/A'}</span>
        </div>

        <div className="member-detail">
          <label>Email:</label>
          <span>{member?.email || 'N/A'}</span>
        </div>

        <div className="member-detail">
          <label>Medicaid:</label>
          <span>{member?.medicaid?.toUpperCase() || 'N/A'}</span>
        </div>

        <div className="member-detail">
          <label>SSN:</label>
          <span>{formatSSN(member?.ssn) || 'N/A'}</span>
        </div>

        <div className="member-detail">
          <label>Language:</label>
          <span>{member?.language || 'N/A'}</span>
        </div>

        <div className="member-detail">
          <label>Enrollment:</label>
          <span>{formatDate(member?.enrollment_date) || 'N/A'}</span>
        </div>

        <div className="member-detail">
          <label>Note:</label>
          <span>{member?.note || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailsCard;