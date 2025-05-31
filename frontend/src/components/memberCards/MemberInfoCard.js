import React, { memo } from 'react';
import EditButton from '../buttons/EditButton';
import DetailRow from '../layout/MemberDetail';
import { formatDate, formatGender, formatPhone, formatSSN } from '../../utils/formatUtils';

const MemberInfoCard = ({ data, onEdit }) => {
  const info = data || [];

  const handleEdit = () => {
    onEdit('info', info);
  };

  return (
		<div className="half-card">
			<h2>Details</h2>
			<div className="card-container">
				<EditButton onClick={handleEdit} />
				<DetailRow label="Member ID" value={info.sadc_member_id} />
				<DetailRow label="Last Name" value={info.last_name} />
				<DetailRow label="First Name" value={info.first_name} />
				<DetailRow label="Birth Date" value={formatDate(info.birth_date)} />
				<DetailRow label="Gender" value={formatGender(info.gender)} />
				<DetailRow label="Phone" value={formatPhone(info.phone)} />
				<DetailRow label="Address" value={info.address} />
				<DetailRow label="Email" value={info.email} />
				<DetailRow label="Medicaid" value={info.medicaid?.toUpperCase()} />
				<DetailRow label="SSN" value={formatSSN(info.ssn)} />
				<DetailRow label="Language" value={info.language} />
				<DetailRow label="Enrollment" value={formatDate(info.enrollment_date)} />
				{info.note && <DetailRow label="Note" value={info.note} />}
			</div>
		</div>
	);
};

export default memo(MemberInfoCard);
