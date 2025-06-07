import React from 'react';

const ListDetail = ({ label, value }) => {
    if (value == null || value === '') return null;

    return (
        <div className="member-box">
            <label className="member-box-label">{label}</label>
            <span className="member-box-list">{value}</span>
        </div>
    );   
};

export default ListDetail;