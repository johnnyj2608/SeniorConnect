import React, { useState, useEffect, memo } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import { formatDate } from '../../utils/formatUtils';
import DetailRow from '../members/MemberDetail';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const MemberAbsencesCard = ({ id, onEdit }) => {
    const [absences, setAbsences] = useState([]);

    useEffect(() => {
		if (id === 'new') return;

		const getAbsencesByMember = async () => {
			try {
					const response = await fetchWithRefresh(`/core/absences/member/${id}`);
			if (!response.ok) return;
					const data = await response.json();
					setAbsences(data);
			} catch (error) {
					console.error('Failed to fetch absences by member:', error);
			}
		};

		getAbsencesByMember();
	}, [id]);

	const handleEdit = () => {
        onEdit('absences', absences, setAbsences);
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
                <Pencil className="edit-icon" onClick={handleEdit} />
                {activeAbsences.length > 0 ? (
                    <ul className="absence-list">
                        {activeAbsences.map((abs, idx) => {
                            return (
                                <li key={idx} className="absence-item">
                                    <DetailRow label="Absence Type" value={abs.absence_type} />
                                    <DetailRow label="Start Date" value={formatDate(abs.start_date)} />
                                    <DetailRow label="End Date" value={formatDate(abs.end_date)} />
                                    <DetailRow label="Status" value={abs.status} />
                                    {abs.note && (
                                            <DetailRow label="Note" value={abs.note} />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>No active absences</p>
                )}
			</div>
		</div>
	);
};

export default memo(MemberAbsencesCard);