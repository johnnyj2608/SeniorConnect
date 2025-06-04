import React, { memo } from 'react';
import { formatPhoto } from '../../utils/formatUtils';

const MemberPhotoCard = ({ data }) => {
    const info = data || [];

    const name = `${info?.last_name || ''}, ${info?.first_name || ''}`.trim();

    return (
        <div className="photo-container">
            <img
                src={formatPhoto(info.photo)}
                alt="Member"
                className="member-photo"
                onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-profile.jpg';
                }}
            />
            <h1>{name ? name : '...'}</h1>
            {info.alt_name && <h2>{info.alt_name}</h2>}
        </div>
    );
};

export default memo(MemberPhotoCard);