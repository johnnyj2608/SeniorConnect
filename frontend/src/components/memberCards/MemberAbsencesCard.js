import React, { memo } from 'react';
import EditButton from '../buttons/EditButton';
import DetailRow from '../layout/MemberDetail';
import { formatDate, formatStatus } from '../../utils/formatUtils';

const MemberAbsencesCard = ({ data, onEdit }) => {
  	const absences = data || [];

	const handleEdit = () => {
		onEdit('absences', absences);
	};

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const activeAbsences = absences.filter(abs => {
		if (!abs.end_date) return true;
		const [year, month, day] = abs.end_date.split('-');
		const endDate = new Date(year, month - 1, day);
		return endDate >= today;
	});

	return (
		<div className="half-card">
			<h2>Absences</h2>
			<div className="card-container">
				<EditButton onClick={handleEdit} />
				{activeAbsences.length > 0 ? (
				<ul className="absence-list">
					{activeAbsences.map((abs, idx) => (
					<li key={idx} className="absence-item">
						<DetailRow label="Absence Type" value={abs.absence_type} />
						<DetailRow label="Start Date" value={formatDate(abs.start_date)} />
						<DetailRow label="End Date" value={formatDate(abs.end_date)} />
						<DetailRow label="Status" value={formatStatus(abs.start_date, abs.end_date)} />
						{abs.note && <DetailRow label="Note" value={abs.note} />}
					</li>
					))}
				</ul>
				) : (
				<p>No active absences</p>
				)}
			</div>
		</div>
	);
};

export default memo(MemberAbsencesCard);