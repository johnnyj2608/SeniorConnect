import React from 'react';
import { formatPhoto } from '../../utils/formatUtils';

const MemberPhotoCard = ({ photo }) => {

    return (
        <div className="photo-container">
            <img
                src={formatPhoto(photo)}
                alt=""
                className="member-photo"
                onError={(e) => (e.target.src = "/default-profile.jpg")}
            />
        </div>
    );
};


export default React.memo(MemberPhotoCard);