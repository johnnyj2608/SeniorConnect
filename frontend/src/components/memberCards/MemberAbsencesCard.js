import React, { useState, useEffect } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import { absence_types } from '../../utils/mapUtils';
import { formatDate } from '../../utils/formatUtils';
import DetailRow from '../members/MemberDetail';

const MemberAbsencesCard = ({ id, onEdit }) => {
    const [absences, setAbsences] = useState([]);

    useEffect(() => {
        const getAbsencesByMember = async () => {
            const response = await fetch(`/core/absences/member/${id}`);
            const data = await response.json();
            setAbsences(data);
        };

        if (id !== 'new') {
            getAbsencesByMember();
        }
    }, [id]);

    const handleEdit = () => {
        onEdit('absences', absences, setAbsences);
    };

    const today = new Date();
    const activeAbsences = absences.filter(abs => {
        const endDate = abs.end_date ? new Date(abs.end_date) : null;
        return !endDate || endDate >= today;
    });

    return (
        <div className="member-half-card">
            <h2>Absences</h2>
            <div className="member-container">
                <Pencil className="edit-icon" onClick={handleEdit} />
                {activeAbsences.length > 0 ? (
                    <ul className="absence-list">
                        {activeAbsences.map((abs, idx) => {
                            const start = new Date(abs.start_date);
                            const status = start > today ? 'Upcoming' : 'Ongoing';
                    
                            return (
                                <li key={idx} className="absence-item">
                                    <DetailRow label="Absence Type" value={absence_types[abs.absence_type]} />
                                    <DetailRow label="Start Date" value={formatDate(abs.start_date)} />
                                    <DetailRow label="End Date" value={formatDate(abs.end_date)} />
                                    <DetailRow label="Status" value={status} />
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

export default MemberAbsencesCard;