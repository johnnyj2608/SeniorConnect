import React, { memo } from 'react';
import EditButton from '../buttons/EditButton';
import ContactDetail from '../layout/ContactDetail';

const MemberContactsCard = ({ data, onEdit }) => {
    const contacts = data || [];

    const handleEdit = () => {
        onEdit('contacts', contacts);
    };

    return (
        <div className="half-card">
            <h2>Contacts</h2>
            <div className="card-container">
                <EditButton onClick={handleEdit} />
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