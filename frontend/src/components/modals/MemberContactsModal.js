import React from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from '../inputs/TextInput';
import SearchContacts from '../inputs/SearchContacts';

const contactTypes = [
    'emergency_contact',
    'primary_care_provider',
    'pharmacy',
    'home_aid',
    'home_care',
    'other',
];

const relationshipTypes = [
    'husband',
    'wife',
    'son',
    'daughter',
    'brother',
    'sister',
    'friend',
    'father',
    'mother',
    'other',
];

const MemberContactsModal = ({ data, handleChange, activeTab, memberID, handleLimit }) => {
    const { t } = useTranslation();

    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;
    const disableFields = disabled || !current.contact_type;
    const limitIndex = current.id === 'new' ? data.length - 1 - activeTab : activeTab;

    const isEmergencyContact = current.contact_type === 'emergency_contact';

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('member.contacts.label')}</h3>
            </div>

            <div className="member-detail">
                <label htmlFor="contactType">
                    {t('member.contacts.label')} *
                </label>
                <select 
                    id="contactType"
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
                    <option value="">{t('general.select_an_option')}</option>
                    {contactTypes.map(type => (
                        <option key={type} value={type}>
                            {t(`member.contacts.${type}`)}
                        </option>
                    ))}
                </select>
            </div>

            {isEmergencyContact && (
                <div className="member-detail">
                    <label htmlFor="relationship">
                        {t('member.contacts.relationship')} *
                    </label>
                    <select 
                        id="relationship"
                        required
                        value={disabled ? '' : current.relationship_type || ''} 
                        onChange={handleChange('relationship_type')}
                        disabled={disableFields}
                    >
                        <option value="">{t('general.select_an_option')}</option>
                        {relationshipTypes.map(type => (
                            <option key={type} value={type}>
                                {t(`member.contacts.${type}`)}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="member-detail">
                <label>{t('member.contacts.name')} *</label>
                <SearchContacts
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

            <TextInput
                label={t('member.contacts.phone')}
                type="number"
                value={current.phone}
                onChange={handleChange('phone')}
                onLimitExceeded={handleLimit('phone', limitIndex)}
                required
                maxLength={10}
                disabled={disableFields}
            />
        </>
    );
};

export default MemberContactsModal;