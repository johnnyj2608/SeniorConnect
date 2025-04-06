import React from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';

const MemberContactsCard = ({ contacts, onEdit }) => {
    return (
        <div className="member-half-card">
        <h2>Contacts</h2>
        <div className="member-container">
            <Pencil className="edit-icon" onClick={onEdit} />
            
            <div className="member-detail">
            <label>Emergency Contact:</label>
            <span>{contacts?.emergency_contact || 'N/A'}</span>
            </div>

            <div className="member-detail">
            <label>Primary Care Provider:</label>
            <span>{contacts?.primary_care_provider || 'N/A'}</span>
            </div>

            <div className="member-detail">
            <label>Pharmacy:</label>
            <span>{contacts?.pharmacy || 'N/A'}</span>
            </div>

            <div className="member-detail">
            <label>Spouse:</label>
            <span>{contacts?.spouse || 'N/A'}</span>
            </div>
        </div>
        </div>
    );
};

export default MemberContactsCard;