import React, { useState, useRef, useEffect } from 'react';
import { ReactComponent as DropdownIcon } from '../assets/dropdown.svg';
import { formatSchedule, sortSchedule } from '../utils/formatUtils';

const Dropdown = ({ display, onChange, options = [], disabled, multiSelect = false }) => {
    const [open, setOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState(display);
    const dropdownRef = useRef(null);

    const isDisabled = disabled || options.length === 0;
    
    const formattedOptions = Array.isArray(options) 
        ? options.map(option => {
            if (typeof option === 'string') {
                return { name: option, value: option };
            }
            if (typeof option === 'object') {
                return {
                    name: option.name || '',
                    value: option.value || option.name || '',
                };
            }
            return null;
        })
        : Object.entries(options).map(([value, name]) => ({
            name,
            value
        }))
        .filter(option => option && option.name !== '');

    const handleSelect = (option) => {
        if (multiSelect) {
            let multiSelectValues;
            if (selectedValues.includes(option.value)) {
                multiSelectValues = selectedValues.filter(value => value !== option.value);
            } else {
                multiSelectValues = [...selectedValues, option.value];
            }
            multiSelectValues = sortSchedule(multiSelectValues);

            setSelectedValues(multiSelectValues);
            onChange({ target: { value: multiSelectValues } });
        } else {
            setSelectedValues(option.name);
            onChange({ target: { value: option.value } });
            setOpen(false);
        }
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
        setSelectedValues(display);
    }, [display]);

    return (
        <div className={`dropdown ${isDisabled ? "disabled" : ""}`} ref={dropdownRef}>
            <div className="dropdown-header" onClick={() => setOpen(!open)}>
                {selectedValues
                    ? (multiSelect
                        ? formatSchedule(selectedValues, true)
                        : selectedValues
                    ) :
                    "Select Option"
                }
                <span className={`dropdown-icon ${open ? "open" : ""}`}><DropdownIcon /></span>
            </div>
            {open && (
                <ul className="dropdown-list">
                    {!multiSelect && (
                        <li key="select-option" onClick={() => handleSelect("")}>
                            <span>Select Option</span>
                        </li>
                    )}
                    {formattedOptions.map((option) => (
                        <li key={option.value} onClick={() => handleSelect(option)}>
                            {multiSelect ? (
                                <div className="dropdown-multi">
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(option.value)}
                                        onChange={() => handleSelect(option.value)}
                                    />
                                    <span>{option.name}</span>
                                </div>
                                ) : (
                                <span>{option.name}</span>
                                )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;