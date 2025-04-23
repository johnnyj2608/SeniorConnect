import React from 'react';
import Dropdown from '../Dropdown';
import { contact_types, relationship_types } from '../../utils/mapUtils';
import AutoCompleteInput from '../AutoCompleteInput';

const MemberContactsModal = ({ data, handleChange, activeTab, memberID }) => {
    const current = data[activeTab] || {};
 
    const disabled = data.filter(tab => !tab.deleted).length <= 0;
    const disableFields = disabled || !current.contact_type;

    return (
        <>
            <h3>Edit Contacts</h3>
            <div className="member-detail">
                <label>Contact Type *</label>
                <Dropdown 
                    display={disabled ? '' : contact_types[current.contact_type]} 
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
                        display={disableFields ? '' : relationship_types[current.relationship_type]}
                        onChange={handleChange('relationship_type')}
                        options={relationship_types}
                        disabled={disableFields}
                    />
                </div>
            )}

            <div className="member-detail">
                <label>Name *</label>
                <AutoCompleteInput
                    value={disableFields ? '' : current.name}
                    contactType={disableFields ? '' : current.contact_type}
                    memberId={memberID}
                    onChange={handleChange('name')}
                    onSelect={(result) => {
                        handleChange('members')({ target: { value: [...result.members, memberID] } });
                        handleChange('name')({ target: { value: result.name } });
                        handleChange('phone')({ target: { value: result.phone } });
                    }}
                    disabled={disableFields}
                />
            </div>

            <div className="member-detail">
                <label>Phone *</label>
                <input
                    type="text"
                    name="phone"
                    value={disableFields ? '' : current.phone || ''}
                    onChange={handleChange('phone')}
                    placeholder="Required"
                    autoComplete="off"
                    disabled={disableFields}
                />
            </div>
        </>
    );
};

export default MemberContactsModal;