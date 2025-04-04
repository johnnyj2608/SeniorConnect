import React from 'react';

const Dropdown = ({ value, onChange, options = [], disabled = false }) => {

    // const sortedOptions = [...options].sort((a, b) => a.name.localeCompare(b.name));
    const formattedOptions = options.map(option =>
        typeof option === 'object' ? option.name : option
    );

    return (
        <select value={value} onChange={onChange} className="dropdown" disabled={disabled || formattedOptions.length === 0}>
            <option value="">Select Option</option>
            {formattedOptions.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
};



export default Dropdown;
