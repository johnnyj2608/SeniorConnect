import React, { useState, useEffect } from 'react';

const MemberModal = ({ member, onClose, onSave }) => {
    const [localMember, setLocalMember] = useState({ ...member });

    const handleChange = (field) => (event) => {
        const { value } = event.target;
        setLocalMember((prevMember) => ({
          ...prevMember,
          [field]: value,
        }));
    };

    const handleSave = () => {
        onSave(localMember);
        onClose();
    };

    useEffect(() => {
        setLocalMember({ ...member });
    }, [member]);

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Edit Member</h3>
                <div className="member-detail">
                    <label>Member ID</label>
                    <input
                        type="number"
                        name="sadc_member_id"
                        value={localMember.sadc_member_id || ''}
                        onChange={handleChange('sadc_member_id')}
                    />
                </div>
                <div className="member-detail">
                    <label>Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        value={localMember.last_name || ''}
                        onChange={handleChange('last_name')}
                    />
                </div>
                <div className="member-detail">
                    <label>First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={localMember.first_name || ''}
                        onChange={handleChange('first_name')}
                    />
                </div>
                <div className="member-detail">
                    <label>Birth Date</label>
                    <input
                        type="date"
                        name="birth_date"
                        value={localMember.birth_date || ''}
                        onChange={handleChange('birth_date')}
                    />
                </div>
                <div className="member-detail">
                    <label>Gender</label>
                    <select 
                        value={localMember.gender} 
                        onChange={handleChange('gender')}>
                        <option value="">Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                    </select>
                </div>
                <div className="member-detail">
                    <label>Phone</label>
                    <input
                        type="number"
                        name="phone"
                        value={localMember.phone || ''}
                        onChange={handleChange('phone')}
                    />
                </div>
                <div className="member-detail">
                    <label>Address</label>
                    <input
                        type="text"
                        name="address"
                        value={localMember.address || ''}
                        onChange={handleChange('address')}
                    />
                </div>
                <div className="member-detail">
                    <label>Email</label>
                    <input
                        type="text"
                        name="email"
                        value={localMember.email || ''}
                        onChange={handleChange('email')}
                    />
                </div>
                <div className="member-detail">
                    <label>Medicaid</label>
                    <input
                        type="text"
                        name="medicaid"
                        value={localMember.medicaid || ''}
                        onChange={handleChange('medicaid')}
                    />
                </div>
            <div className="modal-buttons">
                <button onClick={onClose}>Cancel</button>
                <button onClick={handleSave}>Save</button>
            </div>
            </div>
        </div>
      );
    };

export default MemberModal
