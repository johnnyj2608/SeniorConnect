import React, { useState, useEffect } from 'react';

const MemberModal = ({ member, onClose, onSave, type }) => {
    const [localMember, setLocalMember] = useState({ ...member });

    const handleChange = (field) => (event) => {
        const { value, type, files } = event.target;
        if (type === 'file' && files.length > 0) {
            setLocalMember((prevMember) => ({
                ...prevMember,
                photo: files[0],
            }));
        } else {
            setLocalMember((prevMember) => ({
                ...prevMember,
                [field]: value,
            }));
        }
    };

    useEffect(() => {
        setLocalMember({ ...member });
    }, [member]);

    const renderPhoto = () => (
        <>
            <h3>Edit Photo</h3>
            <div className="photo-container">
                <img 
                    src={localMember.photo instanceof File ? URL.createObjectURL(localMember.photo) : localMember.photo || "/default-profile.jpg"} 
                    alt="Member Photo" 
                    className="preview-photo"
                    onError={(e) => e.target.src = "/default-profile.jpg"}
                />
            </div>
            <input type="file" accept="image/*" onChange={handleChange('photo')} />
        </>
    );

    const renderDetails = () => (
        <>
            <h3>Edit Details</h3>
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
        </>
    );

    const renderAuthorization = () => (
        <>
            <h3>Edit Authorization</h3>
        </>
    );

    const renderContacts = () => (
        <>
            <h3>Edit Contacts</h3>
            <div className="member-detail">
                <label>Emergency Contact</label>
                <input
                    type="text"
                    name="emergency_contact"
                    value={localMember.emergency_contact || ''}
                    onChange={handleChange('emergency_contact')}
                />
            </div>
            <div className="member-detail">
                <label>Primary Care Provider</label>
                <input
                    type="text"
                    name="primary_care_provider"
                    value={localMember.primary_care_provider || ''}
                    onChange={handleChange('primary_care_provider')}
                />
            </div>
            <div className="member-detail">
                <label>Pharmacy</label>
                <input
                    type="text"
                    name="pharmacy"
                    value={localMember.pharmacy || ''}
                    onChange={handleChange('pharmacy')}
                />
            </div>
            <div className="member-detail">
                <label>Spouse</label>
                <input
                    type="text"
                    name="spouse"
                    value={localMember.spouse || ''}
                    onChange={handleChange('spouse')}
                />
            </div>
        </>
    );

    const renderAbsences = () => (
        <>
            <h3>Edit Absences</h3>
        </>
    );

    return (
        <div className="modal">
            <div className="modal-content">
                {type === 'photo' && renderPhoto()}
                {type === 'details' && renderDetails()}
                {type === 'authorization' && renderAuthorization()}
                {type === 'contacts' && renderContacts()}
                {type === 'absences' && renderAbsences()}
                <div className="modal-buttons">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={() => onSave(localMember)}>Save</button>
                </div>
            </div>
        </div>
      );
    };

export default MemberModal
