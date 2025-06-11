import React from 'react';

const CheckboxInput = ({
    label,
    options = [],
    selectedValues = [],
    onChange,
    disabled = false,
    translateFn,
}) => {
    const handleCheckboxChange = (value) => (event) => {
        const checked = event.target.checked;
        let newSelected;
        if (checked) {
            newSelected = [...selectedValues, value];
        } else {
            newSelected = selectedValues.filter((v) => v !== value);
        }
        onChange(newSelected);
    };

    return (
        <div className="member-box">
            {label && <div className="member-box-label">{label}</div>}
            <div className="member-box-list">
                <div className="checkbox-container">
                    {options.map((value) => (
                        <label key={value}>
                            <input
                                type="checkbox"
                                value={value}
                                checked={!disabled && selectedValues.includes(value)}
                                onChange={handleCheckboxChange(value)}
                                disabled={disabled}
                            />
                            {translateFn ? translateFn(value) : value}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CheckboxInput;
