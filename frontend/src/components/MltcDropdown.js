import React from 'react';


const MltcDropdown = ({ value, onChange, options=[] }) => {

    return (
        <select value={value} onChange={onChange}>
        <option value="">Select MLTC</option>
        {options.length > 0 ? (
            options.map((option) => (
            <option key={option.id} value={option.id}>
                {option.name}
            </option>
            ))
        ) : (
            <option disabled>No MLTC options available</option>
        )}
    </select>
    )
}

export default MltcDropdown