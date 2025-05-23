import React, { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { formatPhone } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const AutoCompleteInput = ({ value, onChange, contactType, memberId, onSelect, disabled }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(true);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const fetchSuggestions = async (searchName, contactType) => {
      try {
        const params = new URLSearchParams({
          name: searchName,
          contact_type: contactType,
          member_id: memberId,
        });
        const response = await fetchWithRefresh(`/core/contacts/search/?${params.toString()}`);
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error('Error fetching names:', error);
        return [];
      }
    };

    if (debouncedValue && contactType && !selectedSuggestion) {
      fetchSuggestions(debouncedValue, contactType).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [debouncedValue, contactType, selectedSuggestion, memberId]);

  return (
    <div className="search-dropdown-container">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setSelectedSuggestion(false);
          onChange(e);
        }}
        placeholder="Required"
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