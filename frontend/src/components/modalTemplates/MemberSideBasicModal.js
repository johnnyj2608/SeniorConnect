import React from 'react';

const MemberSideBasicModal = ({ data, handleChange }) => {

    return (
        <>
            <div className="photo-container">
                <img
                    src={data.photo instanceof File ? URL.createObjectURL(data.photo) : data.photo || "/default-profile.jpg"}
                    alt={data.first_name ? `${data.first_name} ${data.last_name}` : "Member"} 
                    className="preview-photo"
                    onError={(e) => e.target.src = "/default-profile.jpg"}
                />
                <div className="member-detail ">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange('photo')}
                />
                </div>
            </div>
            <div className="member-detail">
                <label>Gender</label>
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={data.gender === 'male'}
                            onChange={handleChange('gender')}
                        />
                        Male
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={data.gender === 'female'}
                            onChange={handleChange('gender')}
                        />
                        Female
                    </label>
                </div>
            </div>
            <div className="member-detail">
                <label>Active</label>
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            name="active"
                            value="true"
                            checked={data.active === 'true'}
                            onChange={handleChange('active')}
                        />
                        True
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="active"
                            value="false"
                            checked={data.active === 'false'}
                            onChange={handleChange('active')}
                        />
                        False
                    </label>
                </div>
            </div>
        </>
    );
};

export default MemberSideBasicModal;
