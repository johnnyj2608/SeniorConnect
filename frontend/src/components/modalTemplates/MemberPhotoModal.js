import React from 'react';

const MemberPhotoModal = ({ data, handleChange }) => {

    return (
        <>
            <h3>Edit Photo</h3>
            <div className="photo-container">
                <img
                    src={data.photo instanceof File ? URL.createObjectURL(data.photo) : data.photo || "/default-profile.jpg"}
                    alt="Member Photo"
                    className="preview-photo"
                    onError={(e) => e.target.src = "/default-profile.jpg"}
                />
            </div>
            <div className="member-detail">
                <label>Change Photo</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange('photo')}
                />
            </div>
        </>
    );
};

export default MemberPhotoModal;
