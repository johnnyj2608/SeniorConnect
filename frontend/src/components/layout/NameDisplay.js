import React from 'react';
import usePreferences from '../../hooks/usePreferences';

const NameDisplay = ({ sadcId, memberName, altName }) => {
    const useAltName = usePreferences("alt_name", false);

    const displayName = useAltName && altName ? altName : memberName;
    const prefix = sadcId ? `${sadcId}. ` : '';

    return <>{prefix}{displayName}</>;
};

export default NameDisplay;