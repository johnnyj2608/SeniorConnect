import React, { memo } from 'react';
import { formatPhoto } from '../../utils/formatUtils';
import usePreferences from '../../hooks/usePreferences';

const MemberPhotoCard = ({ data }) => {
    const info = data || [];
    const useAltName = usePreferences("alt_name", false);

    const altName = info.alt_name;
    const fullName = `${info.last_name}, ${info.first_name}`;
  
    const primaryName = useAltName && altName ? altName : fullName;
    const secondaryName = useAltName && altName ? fullName : altName;

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
            {Object.keys(info).length === 0 ? (
                <h1>...</h1>
            ) : (
            <>
                <h1>{primaryName}</h1>
                {secondaryName && <h2>{secondaryName}</h2>}
            </>
            )}
        </div>
    );
};

export default memo(MemberPhotoCard);