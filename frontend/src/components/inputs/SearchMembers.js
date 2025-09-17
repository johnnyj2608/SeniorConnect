import React, { useState, useEffect, memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const SearchMembers = ({ value, onChange, onSelect, showInactive, mltcFilter }) => {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        let url = '/core/members/';
        const params = new URLSearchParams();

        if (mltcFilter) params.append('mltc', mltcFilter);
        if (!showInactive) params.append('active', 'true');
        params.append('unpaginated', 'true');

        if ([...params].length > 0) {
          url += `?${params.toString()}`;
        }

        const res = await fetchWithRefresh(url);
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMembers();
  }, [mltcFilter, showInactive]);

  useEffect(() => {
    const q = value?.toLowerCase().trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const terms = q.split(/\s+/);

    const list = members.filter(m => {
      if (!m) return false;

      const searchable = [
        m.first_name,
        m.last_name,
        m.alt_name,
        m.sadc_member_id?.toString()
      ].filter(Boolean).map(s => s.toLowerCase());

      return terms.every(term => searchable.some(field => field.includes(term)));
    });

    setSearchResults(list);
    setSelectedSuggestion(false);
  }, [members, value]);

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
          onChange(e.target.value);
        }}
        placeholder={t('members.search_id_or_name')}
        autoComplete="off"
        maxLength={50}
      />
      {searchResults.length > 0 && !selectedSuggestion && (
        <ul className="search-dropdown">
          {searchResults.map((m) => (
            <li
              key={m.id}
              onClick={() => {
                onSelect(m);
                setSearchResults([]);
                setSelectedSuggestion(true);
              }}
            >
              {m.sadc_member_id}. {m.first_name} {m.last_name}
              {m.alt_name ? ` (${m.alt_name})` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default memo(SearchMembers);