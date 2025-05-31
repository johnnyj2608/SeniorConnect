import React, { useState, useEffect, memo } from 'react';
import EditButton from '../buttons/EditButton';
import DetailRow from '../layout/MemberDetail';
import { formatDate, formatGender, formatPhone, formatSSN } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const MemberInfoCard = ({ id, onEdit, onPhotoUpdate, onStatusUpdate }) => {
  const [member, setMember] = useState(null);

    useEffect(() => {
      if (id === 'new') return;

      const getMember = async () => {
        try {
          const response = await fetchWithRefresh(`/core/members/${id}/`);
          if (!response.ok) return;

          const data = await response.json();
          setMember(data);
        } catch (error) {
          console.error('Failed to fetch member:', error);
        }
      };

      getMember();
  }, [id]);

  useEffect(() => {
    onPhotoUpdate(member?.photo);
  }, [member, onPhotoUpdate]);

  useEffect(() => {
    onStatusUpdate(member?.active);
  }, [member, onStatusUpdate]);

  const handleEdit = () => {
    if (member) {
      onEdit('basic', member, setMember);
    }
  };
  
  return (
    <div className="half-card">
      <h2>Details</h2>
      <div className="card-container">
        <EditButton onClick={handleEdit} />
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
        {member?.note && (
            <DetailRow label="Note" value={member?.note} />
        )}
      </div>
    </div>
  );
};

export default memo(MemberInfoCard);