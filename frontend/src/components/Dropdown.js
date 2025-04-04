import React, { useState, useRef, useEffect } from 'react';
import { ReactComponent as DropdownIcon } from '../assets/dropdown.svg';

const Dropdown = ({ value, onChange, options = [] }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const formattedOptions = options
        .map(option => (typeof option === 'object' ? option.name : option))
        .filter(option => option !== '');

    const handleSelect = (option) => {
        onChange({ target: { value: option } });
        setOpen(false);
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

    return (
        <div className="dropdown" ref={dropdownRef}>
            <div className="dropdown-header" onClick={() => setOpen(!open)}>
                {value || "Select Option"}
                <span className={`dropdown-icon ${open ? "open" : ""}`}><DropdownIcon /></span>
            </div>
            {open && (
                <ul className="dropdown-list">
                    <li key="select-option" onClick={() => handleSelect("")}>
                        Select Option
                    </li>
                    {formattedOptions.map((option) => (
                        <li key={option} onClick={() => handleSelect(option)}>
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};



export default Dropdown;
