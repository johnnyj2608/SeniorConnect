import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ReactComponent as DropdownIcon } from '../../assets/dropdown.svg';
import { formatSchedule, sortSchedule } from '../../utils/formatUtils';

const DropdownHeader = ({ 
    selectedValues, 
    setOpen, 
    open, 
    multiSelect }) => {
        
    return (
        <div className="dropdown-header" onClick={() => setOpen(!open)}>
            <div className="dropdown-label">
                {selectedValues
                    ? (multiSelect
                        ? formatSchedule(selectedValues, true)
                        : selectedValues
                    )
                    : "Select Option"
                }
            </div>
            <span className={`dropdown-icon ${open ? "open" : ""}`}>
                <DropdownIcon />
            </span>
        </div>
    );
};

const DropdownList = ({
    formattedOptions,
    multiSelect,
    selectedValues,
    handleSelect,
    placeholder }) => {

    return (
        <ul className="dropdown-list">
            {!multiSelect && placeholder && (
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
                                onChange={() => handleSelect(option)}
                            />
                            <span>{option.name}</span>
                        </div>
                    ) : (
                        <span>{option.name}</span>
                    )}
                </li>
            ))}
        </ul>
    );
};


const Dropdown = ({
    display,
    onChange,
    options = [],
    disabled,
    multiSelect = false,
    placeholder = true,
}) => {
    const [open, setOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState(display);
    const dropdownRef = useRef(null);

    const isDisabled = disabled || options.length === 0;
    
    const formattedOptions = useMemo(() => {
        if (Array.isArray(options)) {
          return options.map(option => {
            if (typeof option === 'string') {
              return { name: option, value: option };
            }
            if (typeof option === 'object') {
              return {
                name: option.name || '',
                value: option.value != null ? option.value : option.name || '',
              };
            }
            return null;
          });
        }
        return Object.entries(options)
          .map(([value, name]) => ({ name, value }))
          .filter(option => option && option.name !== '');
    }, [options]);

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
            <DropdownHeader
                selectedValues={selectedValues}
                setOpen={setOpen}
                open={open}
                multiSelect={multiSelect}
            />
            {open && (
                <DropdownList
                    formattedOptions={formattedOptions}
                    multiSelect={multiSelect}
                    selectedValues={selectedValues}
                    handleSelect={handleSelect}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
};

export default Dropdown;