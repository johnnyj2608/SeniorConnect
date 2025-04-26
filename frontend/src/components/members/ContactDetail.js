import React from 'react'
import { formatPhone } from '../../utils/formatUtils';

const ContactDetail = ({ label, contact }) => (
    <div className="member-detail">
        <label>{label}:</label>
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


export default ContactDetail