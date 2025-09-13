import React, { memo, useState, useEffect } from 'react';
import { formatPhoto } from '../../utils/formatUtils';
import usePreferences from '../../hooks/usePreferences';

const MemberPhotoCard = ({ data, small }) => {
    const [photoURL, setPhotoURL] = useState("/default-profile.jpg");
    const info = data || [];
    const useAltName = usePreferences("alt_name", false);

    const altName = info.alt_name;
    const fullName = `${info.last_name}, ${info.first_name}`;
  
    const primaryName = useAltName && altName ? altName : fullName;
    const secondaryName = useAltName && altName ? fullName : altName;

    const imgClass = small ? 'member-photo small' : 'member-photo';

    useEffect(() => {
        async function fetchPhoto() {
            const result = await formatPhoto(info.photo);
            setPhotoURL(result); 
        }
        fetchPhoto();
    }, [info.photo])

    if (!info.photo) return null;

    return (
        <div className="photo-container">
            <img
                src={photoURL}
                alt="Member"
                className={imgClass}
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