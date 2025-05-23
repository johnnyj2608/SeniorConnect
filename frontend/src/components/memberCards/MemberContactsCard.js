import React, { useState, useEffect, memo } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import ContactDetail from '../members/ContactDetail';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const MemberContactsCard = ({ id, onEdit }) => {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        if (id === 'new') return;

        const getContactsByMember = async () => {
            try {
                const response = await fetchWithRefresh(`/core/contacts/member/${id}`);
                if (!response.ok) return;

                const data = await response.json();
                setContacts(data);
            } catch (error) {
                console.error('Failed to fetch contacts by member:', error);
            }
        };

        getContactsByMember();
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

export default memo(MemberContactsCard);