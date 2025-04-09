import React, { useState, useRef, useEffect } from 'react';
import { ReactComponent as DropdownIcon } from '../assets/dropdown.svg';
import { formatSchedule, sortSchedule } from '../utils/formatUtils';

const Dropdown = ({ value, onChange, options = [], disabled, multiSelect = false }) => {
    const [open, setOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState(value);
    const dropdownRef = useRef(null);

    const isDisabled = disabled || options.length === 0;

    const formattedOptions = options
        .map(option => (typeof option === 'object' ? option.name : option))
        .filter(option => option !== '');

    const handleSelect = (option) => {
        let updatedSelectedValues;

        if (multiSelect) {
            if (selectedValues.includes(option)) {
                updatedSelectedValues = selectedValues.filter(value => value !== option);
            } else {
                updatedSelectedValues = [...selectedValues, option];
            }
            updatedSelectedValues = sortSchedule(updatedSelectedValues);
        } else {
            updatedSelectedValues = option;
            setOpen(false);
        }
        setSelectedValues(updatedSelectedValues);
        onChange({ target: { value: updatedSelectedValues } });
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setSelectedValues(value);
    }, [value]);

    return (
        <div className={`dropdown ${isDisabled ? "disabled" : ""}`} ref={dropdownRef}>
            <div className="dropdown-header" onClick={() => setOpen(!open)}>
            {multiSelect
                ? (selectedValues.length > 0
                    ? formatSchedule(selectedValues, true)
                    : "Select Option"
                )
                : (selectedValues 
                    ? selectedValues 
                    : 'Select Option'
                )}
                <span className={`dropdown-icon ${open ? "open" : ""}`}><DropdownIcon /></span>
            </div>
            {open && (
                <ul className="dropdown-list">
                    {!multiSelect && (
                        <li key="select-option" onClick={() => handleSelect("")}>
                            Select Option
                        </li>
                    )}
                    {formattedOptions.map((option) => (
                        <li key={option} onClick={() => handleSelect(option)}>
                            {multiSelect ? (
                                <div className="dropdown-multi">
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(option)}
                                        onChange={() => handleSelect(option)}
                                    />
                                    <span>{option}</span>
                                </div>
                                ) : (
                                <span>{option}</span>
                                )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;