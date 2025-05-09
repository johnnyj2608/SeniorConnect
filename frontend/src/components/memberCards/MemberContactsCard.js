import React, { useState, useEffect } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import ContactDetail from '../members/ContactDetail';

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

    const handleEdit = () => {
        onEdit('contacts', contacts, setContacts);
    };

    return (
        <div className="half-card">
            <h2>Contacts</h2>
            <div className="card-container">
                <Pencil className="edit-icon" onClick={handleEdit} />
                {contacts.length === 0 ? (
                    <p>No contacts available.</p>
                ) : (
                    contacts.map((contact) => (
                        <ContactDetail
                            key={contact.id}
                            label={contact.contact_type}
                            contact={contact}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default MemberContactsCard;