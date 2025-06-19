import React from 'react';

const MemberDetail = ({ label, value }) => {
    if (value == null || value === '') return null;

    return (
        <div className="member-detail">
            <label>{label}:</label>
            <span>{value}</span>
        </div>
    );   
};

export default MemberDetail;