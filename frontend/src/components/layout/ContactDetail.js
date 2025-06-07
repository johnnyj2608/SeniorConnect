import React from 'react'
import { formatPhone } from '../../utils/formatUtils';

const ContactDetail = ({ label, name, phone }) => {
    return (
        <div className="member-detail">
            <label>{label}:</label>
            <span className="member-detail-contacts">
                {(name || phone) ? (
                    <>
                        <div>{name}</div>
                        <div>{formatPhone(phone)}</div>
                    </>
                ) : (
                    'N/A'
                )}
            </span>
        </div>
    );
};


export default ContactDetail