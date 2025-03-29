import React from 'react';

const MemberDetailsModal = ({ data, handleChange }) => {
    return (
        <>
            <h3>Edit Details</h3>
            <div className="member-detail">
                <label>Member ID</label>
                <input
                    type="number"
                    value={data.sadc_member_id || ''}
                    onChange={handleChange('sadc_member_id')}
                />
            </div>
            <div className="member-detail">
                <label>Last Name</label>
                <input
                    type="text"
                    value={data.last_name || ''}
                    onChange={handleChange('last_name')}
                />
            </div>
            <div className="member-detail">
                <label>First Name</label>
                <input
                    type="text"
                    value={data.first_name || ''}
                    onChange={handleChange('first_name')}
                />
            </div>
            <div className="member-detail">
                <label>Birth Date</label>
                <input
                    type="date"
                    value={data.birth_date || ''}
                    onChange={handleChange('birth_date')}
                />
            </div>
            <div className="member-detail">
                <label>Gender</label>
                <select value={data.gender} onChange={handleChange('gender')}>
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                </select>
            </div>
            <div className="member-detail">
                <label>Phone</label>
                <input
                    type="number"
                    value={data.phone || ''}
                    onChange={handleChange('phone')}
                />
            </div>
            <div className="member-detail">
                <label>Address</label>
                <input
                    type="text"
                    value={data.address || ''}
                    onChange={handleChange('address')}
                />
            </div>
            <div className="member-detail">
                <label>Email</label>
                <input
                    type="text"
                    value={data.email || ''}
                    onChange={handleChange('email')}
                />
            </div>
            <div className="member-detail">
                <label>Medicaid</label>
                <input
                    type="text"
                    value={data.medicaid || ''}
                    onChange={handleChange('medicaid')}
                />
            </div>
        </>
    );
};

export default MemberDetailsModal;
