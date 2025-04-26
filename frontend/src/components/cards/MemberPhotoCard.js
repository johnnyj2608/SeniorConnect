import React from 'react';

const MemberPhotoCard = ({ photo }) => {

    return (
        <div className="photo-container">
            <img
            src={photo instanceof File ? URL.createObjectURL(photo) : photo || "/default-profile.jpg"}
            alt=""
            className="member-photo"
            onError={(e) => e.target.src = "/default-profile.jpg"}
            />
        </div>
    );
};

export default MemberPhotoCard;