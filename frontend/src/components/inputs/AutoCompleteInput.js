import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useDebounce from '../../hooks/useDebounce';
import { formatPhone, normalizeField } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const AutoCompleteInput = ({ value, onChange, contactType, memberId, onSelect, disabled }) => {
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(true);
  const debouncedValue = useDebounce(value, 500);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async (searchName, contactType) => {
      try {
        const params = new URLSearchParams({
          name: searchName,
          contact_type: normalizeField(contactType),
          member_id: memberId,
        });
        const response = await fetchWithRefresh(`/core/contacts/search/?${params.toString()}`);
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error(error);
        return [];
      }
    };

    if (debouncedValue && contactType && !selectedSuggestion) {
      fetchSuggestions(debouncedValue, contactType).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [debouncedValue, contactType, selectedSuggestion, memberId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSelectedSuggestion(true);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-dropdown-container" ref={searchRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setSelectedSuggestion(false);
          onChange(e);
        }}
        placeholder={t('general.required')}
        autoComplete="off"
        disabled={disabled}
      />
      {searchResults.length > 0 && !selectedSuggestion && (
        <ul className="search-dropdown">
          {searchResults.map((result, idx) => (
            <li
              key={idx}
              onClick={() => {
                onSelect(result);
                setSearchResults([]);
                setSelectedSuggestion(true);
              }}
            >
              {result.name} | {formatPhone(result.phone)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoCompleteInput;