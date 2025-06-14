import React from 'react';

const CheckboxInput = ({
    options = [],
    selectedValues = [],
    onChange = () => {},
    disabled = false,
    isAdmin = false,
    translateFn,
}) => {
    const handleCheckboxChange = (value) => (event) => {
        const checked = event.target.checked;
        const newSelected = checked
            ? [...selectedValues, value]
            : selectedValues.filter((v) => v !== value);
        onChange(newSelected);
    };

    return (
        <div className="checkbox-container">
            {options.map(({ id, name }) => (
                <label key={id}>
                    <input
                        type="checkbox"
                        value={id}
                        checked={selectedValues.includes(id)}
                        onChange={handleCheckboxChange(id)}
                        disabled={disabled || isAdmin}
                    />
                    {translateFn ? translateFn(name) : name}
                </label>
            ))}
        </div>
    );
};

export default CheckboxInput;