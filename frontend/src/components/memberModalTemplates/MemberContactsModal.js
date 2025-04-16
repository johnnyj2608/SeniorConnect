import React from 'react';
import Dropdown from '../Dropdown';
import { CONTACT_TYPES, RELATIONSHIP_TYPES } from '../../utils/mapUtils';

const MemberContactsModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};
 
    const disabled = data.filter(tab => !tab.deleted).length <= 0

    return (
        <>
            <h3>Edit Contacts</h3>
            <div className="member-detail">
                <label>Contact Type *</label>
                <Dropdown 
                    display={CONTACT_TYPES[current.contact_type]|| 0} 
                    onChange={handleChange('contact_type')}
                    options={CONTACT_TYPES}
                    disabled={disabled}
                />
            </div>

            {current.contact_type === 'emergency' && (
                <div className="member-detail">
                    <label>Relationship *</label>
                    <Dropdown 
                        display={RELATIONSHIP_TYPES[current.relationship_type] || ''}
                        onChange={handleChange('relationship_type')}
                        options={RELATIONSHIP_TYPES}
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
