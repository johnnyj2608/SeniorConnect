import React from 'react'

const DetailRow = ({ label, value }) => {
    return (
        <div className="member-detail">
            <label>{label}:</label>
            <span>{value || 'N/A'}</span>
        </div>
    );   
};


export default DetailRow