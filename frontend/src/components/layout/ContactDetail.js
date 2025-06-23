import React from 'react';
import { formatPhone } from '../../utils/formatUtils';

const ContactDetail = ({ label, name, contact, email = false }) => {
  if (!name) return null;

  let displayName = name;
  let displayContact = contact;

  if (email) {
    const parts = name.split('@');
    displayName = parts[0] || '';
    displayContact = parts[1] || '';
  }

  return (
    <div className="member-detail">
      <label>{label}:</label>
      <span className="member-detail-contacts">
        <div>{displayName}</div>
        {displayContact && <div>{email ? `@${displayContact}` : formatPhone(displayContact)}</div>}
      </span>
    </div>
  );
};

export default ContactDetail;