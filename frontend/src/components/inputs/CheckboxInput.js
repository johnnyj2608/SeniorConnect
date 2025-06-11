import React from 'react';

const CheckboxInput = ({
    label,
    options = [],
    selectedValues = [],
    onChange,
    disabled = false,
    translateFn,
    isAdmin = false,
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
                    {options.map(({ id, name }) => (
                        <label key={id}>
                            <input
                                type="checkbox"
                                value={id}
                                checked={!disabled && selectedValues.includes(id)}
                                onChange={handleCheckboxChange(id)}
                                disabled={disabled || isAdmin}
                            />
                            {translateFn ? translateFn(name) : name}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CheckboxInput;
