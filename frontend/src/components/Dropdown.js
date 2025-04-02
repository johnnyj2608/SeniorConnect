import React from 'react';

const Dropdown = ({ value, onChange, options = [] }) => {

    // const sortedOptions = [...options].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <select value={value} onChange={onChange} className="dropdown">
            <option value="">Select Option</option>
            {options.map((option) => (
                <option key={option.name} value={option.name}>
                    {option.name}
                </option>
            ))}
        </select>
    );
};



export default Dropdown;
