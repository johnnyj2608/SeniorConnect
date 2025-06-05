import React from 'react';

const DetailRow = ({ label, value }) => {
    if (value == null || value === '') return null;

    return (
        <div className="member-detail">
            <label>{label}:</label>
            <span>{value}</span>
        </div>
    );   
};

export default DetailRow;