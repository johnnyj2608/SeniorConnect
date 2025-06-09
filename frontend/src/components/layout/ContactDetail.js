import React from 'react'
import { formatPhone } from '../../utils/formatUtils';

const ContactDetail = ({ label, name, phone }) => {
    if (name == null || name === '') return null;
    if (phone == null || phone === '') return null;

    return (
        <div className="member-detail">
            <label>{label}:</label>
            <span className="member-detail-contacts">
                <div>{name}</div>
                <div>{formatPhone(phone)}</div>
            </span>
        </div>
    );
};


export default ContactDetail