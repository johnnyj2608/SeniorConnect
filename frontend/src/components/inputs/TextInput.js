import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Stop } from '../../assets/stop.svg';

const TextInput = ({
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    disabled = false,
    maxLength = 50,
    showDisabled = false,
    onLimitExceeded = () => {},
}) => {
    const { t } = useTranslation();
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        const length = value ? String(value).length : 0;
        setCharCount(length);
    }, [value]);

    const handleChange = (e) => {
        const inputValue = e.target.value;
        setCharCount(inputValue.length);
        onChange(e);

        onLimitExceeded(String(inputValue).length > maxLength);
    };

    const invalidNumbers = new Set(['e', 'E', '+', '-']);

    return (
        <>
            <div className="member-detail">
                <label>
                    {label}
                    {required && ' *'}
                </label>
                <input
                    type={type}
                    value={
                        disabled
                            ? (showDisabled ? value || '' : '')
                            : value || ''
                        }
                    onChange={handleChange}
                    onKeyDown={(e) => {
                        if (type === 'number' && invalidNumbers.has(e.key)) {
                            e.preventDefault();
                        }
                    }}
                    placeholder={required ? t('general.required') : ''}
                    autoComplete="off"
                    required={required}
                    disabled={disabled}
                />
            </div>
            {charCount > maxLength && (
                <div className="member-detail-limit">
                    <span className="limit-warning">
                        <Stop /> {t('errors.character_limit', { limit: maxLength })}
                    </span>
                </div>
            )}
        </>
    );
};

export default TextInput;