import React, { useState, useEffect } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import { formatDate, formatGender, formatPhone, formatSSN } from '../../utils/formatUtils';
import DetailRow from '../MemberDetail';

const MemberDetailsCard = ({ id, onEdit, onPhotoUpdate }) => {
  const [member, setMember] = useState(null);

  useEffect(() => {
    const getMember = async () => {
      const response = await fetch(`/core/members/${id}/`);
      const data = await response.json();
      setMember(data);
      onPhotoUpdate(data.photo);
    };

    if (id !== 'new') {
      getMember();
    }
  }, [id, onPhotoUpdate]);

  useEffect(() => {
    onPhotoUpdate(member?.photo);
  }, [member, onPhotoUpdate]);

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
        <DetailRow label="Member ID" value={member?.sadc_member_id} />
        <DetailRow label="Last Name" value={member?.last_name} />
        <DetailRow label="First Name" value={member?.first_name} />
        <DetailRow label="Birth Date" value={formatDate(member?.birth_date)} />
        <DetailRow label="Gender" value={formatGender(member?.gender)} />
        <DetailRow label="Phone" value={formatPhone(member?.phone)} />
        <DetailRow label="Address" value={member?.address} />
        <DetailRow label="Email" value={member?.email} />
        <DetailRow label="Medicaid" value={member?.medicaid?.toUpperCase()} />
        <DetailRow label="SSN" value={formatSSN(member?.ssn)} />
        <DetailRow label="Language" value={member?.language} />
        <DetailRow label="Enrollment" value={formatDate(member?.enrollment_date)} />
        <DetailRow label="Note" value={member?.note} />
      </div>
    </div>
  );
};

export default MemberDetailsCard;