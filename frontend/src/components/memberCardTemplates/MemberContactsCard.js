import React, { useState, useEffect } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import ContactDetail from '../ContactDetail';

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

    const uniqueContacts = contacts.reduce((acc, contact) => {
        if (!acc[contact.contact_type]) {
            acc[contact.contact_type] = contact;
        }
        return acc;
    }, {});

    const handleEdit = () => {
        onEdit('contacts', contacts, setContacts);
    };

    return (
        <div className="member-half-card">
            <h2>Contacts</h2>
            <div className="member-container">
                <Pencil className="edit-icon" onClick={handleEdit} />
                <ContactDetail label="Emergency Contact" contact={uniqueContacts.emergency} />
                <ContactDetail label="Primary Care Provider" contact={uniqueContacts.primary_provider} />
                <ContactDetail label="Pharmacy" contact={uniqueContacts.pharmacy} />
                <ContactDetail label="Home Aid" contact={uniqueContacts.home_aid} />
            </div>
        </div>
    );
};

export default MemberContactsCard;