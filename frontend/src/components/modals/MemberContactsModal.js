import React from 'react';
import AutoCompleteInput from '../inputs/AutoCompleteInput';

const contactTypes = [
    'Emergency Contact',
    'Primary Care Provider',
    'Pharmacy',
    'Home Aid',
    'Home Care',
    'Other',
];

const relationshipTypes = [
    'Husband',
    'Wife',
    'Son',
    'Daughter',
    'Brother',
    'Sister',
    'Friend',
    'Father',
    'Mother',
    'Other',
];

const MemberContactsModal = ({ data, handleChange, activeTab, memberID }) => {
    const current = data[activeTab] || {};
 
    const disabled = data.filter(tab => !tab.deleted).length <= 0;
    const disableFields = disabled || !current.contact_type;

    return (
        <>
            <div className="modal-header">
                <h3>Edit Contacts</h3>
            </div>
            <div className="member-detail">
                <label>Contact Type *</label>
                <select 
                    required
                    value={disabled ? '' : current.contact_type || ''} 
                    onChange={(e) => {
                        handleChange('contact_type')(e);
                        handleChange('relationship_type')({ target: { value: '' } });
                        handleChange('name')({ target: { value: '' } });
                        handleChange('phone')({ target: { value: '' } });
                    }}
                    disabled={disabled}
                >
                    <option value="">Select an option</option>
                    {contactTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            {current.contact_type === 'Emergency Contact' && (
                <div className="member-detail">
                    <label>Relationship *</label>
                    <select 
                        required
                        value={disabled ? '' : current.relationship_type || ''} 
                        onChange={handleChange('relationship_type')}
                        disabled={disableFields}
                    >
                        <option value="">Select an option</option>
                        {relationshipTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
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
                    type="number"
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