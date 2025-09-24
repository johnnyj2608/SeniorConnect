import React, { memo, useState, useEffect } from 'react';
import { formatPhoto } from '../../utils/formatUtils';
import usePreferences from '../../hooks/usePreferences';

const MemberPhotoCard = ({ photo, data, small }) => {
  const [photoURL, setPhotoURL] = useState("/default-profile.jpg");
  const info = data || {};
  const useAltName = usePreferences("alt_name", false);

  const altName = info.alt_name;
  const fullName = `${info.last_name}, ${info.first_name}`;
  const primaryName = useAltName && altName ? altName : fullName;
  const secondaryName = useAltName && altName ? fullName : altName;

  const status = info?.active === false ? 'inactive' : null;
  const imgClass = `member-photo${small ? ' small' : ''}${status ? ` ${status}` : ''}`;

  const photoPath = photo || info.photo;

  useEffect(() => {
    if (!photoPath) {
      setPhotoURL("/default-profile.jpg");
      return;
    }

    const fetchPhoto = async () => {
      if (photo) {
        setPhotoURL(photo);
      } else {
        const result = await formatPhoto(photoPath);
        setPhotoURL(result);
      }
    };

    fetchPhoto();
  }, [photo, photoPath, info?.id]);


  // Refresh signed URL on error
  const handleError = async (e) => {
    e.target.onerror = null;
    if (!info.photo) return;
    const result = await formatPhoto(info.photo);
    e.target.src = result;
  };

  if (!info || Object.keys(info).length === 0) return null;

  return (
    <div className="photo-container">
      <img
        src={photoURL}
        alt="Member"
        className={imgClass}
        onError={handleError}
      />
      <h1>{primaryName}</h1>
      {secondaryName && <h2>{secondaryName}</h2>}
    </div>
  );
};

export default memo(MemberPhotoCard);