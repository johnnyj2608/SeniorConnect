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
                <label htmlFor="image-upload" className="image-upload">
                        Choose Photo
                </label>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleChange('photo')}
                />
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

export default MemberSideBasicModal;
