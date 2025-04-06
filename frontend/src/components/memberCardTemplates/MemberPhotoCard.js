import React, { useState, useEffect } from 'react';
import { formatDate } from '../../utils/formatUtils';

const MemberPhotoCard = ({ photo }) => {

    return (
        <div className="member-photo-card">
            <div className="photo-container">
                <img
                src={photo instanceof File ? URL.createObjectURL(photo) : photo || "/default-profile.jpg"}
                alt="Member Photo"
                className="member-photo"
                onError={(e) => e.target.src = "/default-profile.jpg"}
                />
            </div>
        </div>
    );
};

export default MemberPhotoCard;