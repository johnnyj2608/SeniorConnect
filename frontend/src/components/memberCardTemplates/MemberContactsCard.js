import React, { useState, useEffect } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';

const MemberContactsCard = ({ id, onEdit }) => {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        const getContactsByMember = async () => {
            const response = await fetch(`/core/contacts/member/${id}`);
            const data = await response.json();
            setContacts(data);
        };

        if (id !== 'new') {
            getContactsByMember();
        }
        
    }, [id]);

    return (
        <div className="member-half-card">
            <h2>Contacts</h2>
            <div className="member-container">
                <Pencil className="edit-icon" onClick={onEdit} />
            </div>
        </div>
    );
};

export default MemberContactsCard;