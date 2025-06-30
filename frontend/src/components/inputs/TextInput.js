import React, { useState } from 'react';
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
    onLimitExceeded = () => {},
}) => {
    const { t } = useTranslation();
    const [charCount, setCharCount] = useState(0);

    const handleChange = (e) => {
        const inputValue = e.target.value;
        setCharCount(inputValue.length);
        onChange(e);

        onLimitExceeded(String(inputValue).length > maxLength);
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
                />
            </div>
            <div className="member-detail-limit">
                {charCount > maxLength && (
                    <span className="limit-warning">
                        <Stop /> {t('errors.character_limit', { limit: maxLength })}
                    </span>
                )}
            </div>
        </>
    );
};

export default TextInput;