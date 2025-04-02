import React, { useState, useEffect } from 'react';
import LanguageDropdown from '../Dropdown';

const MemberBasicModal = ({ data, handleChange }) => {
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
                    value={data.medicaid?.toUpperCase() || ''}
                    onChange={handleChange('medicaid')}
                />
            </div>
            
            <div className="member-detail">
                <label>SSN</label>
                <input
                    type="text"
                    value={data.ssn || ''}
                    onChange={handleChange('ssn')}
                />
            </div>

            <div className="member-detail">
                <label>Note</label>
                <input
                    type="text"
                    value={data.note || ''}
                    onChange={handleChange('note')}
                />
            </div>
        </>
    );
};

const MemberSideBasicModal = ({ data, handleChange }) => {
    const [languageOptions, setLanguageOptions] = useState([]);

    useEffect(() => {
        getLanguageOptions()
    }, []);

    const getLanguageOptions = async () => {
        const response = await fetch('/core/languages/');
        const data = await response.json();
        setLanguageOptions(data);
    };

    return (
        <>
            <div className="photo-container">
                <img
                    src={data.photo instanceof File ? URL.createObjectURL(data.photo) : data.photo || "/default-profile.jpg"}
                    alt={data.first_name ? `${data.first_name} ${data.last_name}` : "Member"} 
                    className="preview-photo"
                    onError={(e) => e.target.src = "/default-profile.jpg"}
                />
                <label htmlFor="image-upload" className="image-upload">
                    Choose Photo
                </label>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleChange('photo')}
                    style={{ display: 'none' }}
                />
            </div>
            <div className="member-detail">
                <label>Gender</label>
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            name="gender"
                            value="M"
                            checked={data.gender === 'M'}
                            onChange={handleChange('gender')}
                        />
                        Male
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="gender"
                            value="F"
                            checked={data.gender === 'F'}
                            onChange={handleChange('gender')}
                        />
                        Female
                    </label>
                </div>
            </div>

            <div className="member-detail">
                <label>Language</label>
                <LanguageDropdown 
                    value={data?.language?.id || 0} 
                    onChange={handleChange('language')}
                    options={languageOptions} 
                />
            </div>

            <div className="member-detail">
                <label>
                    <input
                        type="checkbox"
                        name="active"
                        checked={data.active === true}
                        onChange={(e) => handleChange('active')({ target: { value: e.target.checked } })}
                    />
                    Active
                </label>
            </div>
        </>
    );
};

export { MemberBasicModal, MemberSideBasicModal };
