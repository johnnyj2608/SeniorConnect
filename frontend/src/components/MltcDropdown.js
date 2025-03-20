import React, { useState, useEffect } from 'react';


const MltcDropdown = ({ value, onChange }) => {
    const [mltcOptions, setMltcOptions] = useState([]);

    const getMltcOptions = async () => {
        const response = await fetch('/core/mltc/');
        const data = await response.json();
        setMltcOptions(data);
    };

    useEffect(() => {
        getMltcOptions();
    }, [])

    return (
        <select value={value} onChange={onChange}>
            <option value="">Select MLTC</option>
            {mltcOptions.map((option) => (
                <option key={option.id} value={option.id}>
                    {option.name}
                </option>
            ))}
        </select>
    )
}

export default MltcDropdown