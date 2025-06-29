import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Stop } from '../../assets/stop.svg'

const TextInput = ({
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    disabled = false,
    maxLength = 50,
}) => {
    const { t } = useTranslation();

    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        setCharCount(value ? value.length : 0);
    }, [value]);
    
    const handleChange = (e) => {
        setCharCount(e.target.value.length);
        onChange(e);
    };

    return (
        <>
            <div className="member-detail">
                <label>
                    {label}
                    {required && ' *'}
                </label>
                <input
                    type={type}
                    value={disabled ? '' : value || ''}
                    onChange={handleChange}
                    placeholder={required ? t('general.required') : ''}
                    autoComplete="off"
                    required={required}
                    disabled={disabled}
                    maxLength={maxLength}
                />
                
            </div>
            {charCount > maxLength && (
                <div className="member-detail-limit">
                    <Stop /> {t('errors.character_limit', { limit: maxLength })}
                </div>
            )}
        </>
    );
};

export default TextInput;