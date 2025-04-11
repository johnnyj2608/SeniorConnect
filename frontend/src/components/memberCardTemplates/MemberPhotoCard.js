import React from 'react';

const MemberPhotoCard = ({ photo }) => {

    return (
        <div className="member-photo-card">
            <div className="photo-container">
                <img
                src={photo instanceof File ? URL.createObjectURL(photo) : photo || "/default-profile.jpg"}
                alt=""
                className="member-photo"
                onError={(e) => e.target.src = "/default-profile.jpg"}
                />
            </div>
        </div>
    );
};

export default MemberPhotoCard;