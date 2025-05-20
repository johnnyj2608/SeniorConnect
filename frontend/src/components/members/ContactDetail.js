import React from 'react'
import { formatPhone } from '../../utils/formatUtils';
import { contact_types } from '../../utils/mapUtils';

const ContactDetail = ({ label, contact }) => {
    return (
        <div className="member-detail">
            <label>{contact_types[label]}:</label>
            <span className="member-detail-contacts">
                {contact ? (
                    <>
                        <div>{contact.name}</div>
                        <div>{formatPhone(contact.phone)}</div>
                    </>
                ) : (
                    'N/A'
                )}
            </span>
        </div>
    );
};


export default ContactDetail