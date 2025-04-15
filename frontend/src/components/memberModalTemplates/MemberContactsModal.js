import React from 'react';
import Dropdown from '../Dropdown';

const MemberContactsModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};

    const CONTACT_TYPE_OPTIONS = [
        'Emergency Contact',
        'Home Aid',
        'Primary Care Provider',
        'Pharmacy',
        'Other',
    ];    
    
    const RELATIONSHIP_TYPE_OPTIONS = [
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
 
    const disabled = data.filter(tab => !tab.deleted).length <= 0

    // Fix value not equal to label

    return (
        <>
            <h3>Edit Contacts</h3>
            <div className="member-detail">
                <label>Contact Type *</label>
                <Dropdown 
                    value={current.contact_type|| 0} 
                    onChange={handleChange('contact_type')}
                    options={CONTACT_TYPE_OPTIONS}
                    disabled={disabled}
                />
            </div>

            {current.contact_type === 'Emergency Contact' && (
                <div className="member-detail">
                    <label>Relationship *</label>
                    <Dropdown 
                        value={current.relationship_type || ''}
                        onChange={handleChange('relationship_type')}
                        options={RELATIONSHIP_TYPE_OPTIONS}
                        disabled={disabled}
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
                    disabled={disabled}
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
                    disabled={disabled}
                />
            </div>

            {/* Spouse */}
        </>
    );
};

export default MemberContactsModal;
