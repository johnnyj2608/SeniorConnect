import React from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';

const MemberAbsencesCard = ({ absences, onEdit }) => {
    return (
        <div className="member-half-card">
            <h2>Absences</h2>
            <div className="member-container">
                <Pencil className="edit-icon" onClick={onEdit} />
            </div>
        </div>
    );
};

export default MemberAbsencesCard;