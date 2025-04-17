import React, { useState, useEffect } from 'react';
import Dropdown from '../Dropdown';
import useDebounce from '../../hooks/useDebounce';
import { contact_types, relationship_types } from '../../utils/mapUtils';

const MemberContactsModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};
 
    const disabled = data.filter(tab => !tab.deleted).length <= 0;
    const disableFields = disabled || !current.contact_type;

    const searchName = useDebounce(current.name, 500);
    const [searchResults, setSearchResults] = useState([]);

    const searchNames = async (searchName, contactType) => {
        try {
            const params = new URLSearchParams({
                name: searchName,
                contact_type: contactType,
            });
            
            const response = await fetch(`/core/contacts/search/?${params.toString()}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching names:', error);
            return [];
        }
    };

    useEffect(() => {
        if (searchName && current.contact_type) {
            searchNames(searchName, current.contact_type)
                .then((results) => setSearchResults(results));
        } else {
            setSearchResults([]);
        }
    }, [searchName, current.contact_type]);

    console.log(searchResults);

    return (
        <>
            <h3>Edit Contacts</h3>
            <div className="member-detail">
                <label>Contact Type *</label>
                <Dropdown 
                    display={contact_types[current.contact_type] || 0} 
                    onChange={(e) => {
                        handleChange('contact_type')(e);
                        handleChange('relationship_type')({ target: { value: '' } });
                        handleChange('name')({ target: { value: '' } });
                        handleChange('phone')({ target: { value: '' } });
                    }}
                    options={contact_types}
                    disabled={disabled}
                />
            </div>

            {current.contact_type === 'emergency' && (
                <div className="member-detail">
                    <label>Relationship *</label>
                    <Dropdown 
                        display={relationship_types[current.relationship_type] || ''}
                        onChange={handleChange('relationship_type')}
                        options={relationship_types}
                        disabled={disableFields}
                    />
                </div>
            )}

            <div className="member-detail">
                <label>Name *</label>
                <input
                    type="text"
                    name="name"
                    value={current.name || ''}
                    onChange={handleChange('name')}
                    placeholder="Required"
                    disabled={disableFields}
                />
            </div>

            <div className="member-detail">
                <label>Phone *</label>
                <input
                    type="text"
                    name="phone"
                    value={current.phone || ''}
                    onChange={handleChange('phone')}
                    placeholder="Required"
                    disabled={disableFields}
                />
            </div>
        </>
    );
};

export default MemberContactsModal;