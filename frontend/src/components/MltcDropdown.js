import React from 'react';

const MltcDropdown = ({ value, onChange, options = [] }) => {
    
    const sortedOptions = [...options].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <select value={value} onChange={onChange} className="mltc-dropdown">
            <option value="">Select MLTC</option>
            {sortedOptions.length > 0 ? (
                sortedOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))
            ) : (
                <option disabled>No MLTC options available</option>
            )}
            <option value="Unknown">Unknown</option>
        </select>
    );
};

export default MltcDropdown;
