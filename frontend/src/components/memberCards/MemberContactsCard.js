import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import EditButton from '../buttons/EditButton';
import ContactDetail from '../layout/ContactDetail';

const MemberContactsCard = ({ data, onEdit }) => {
    const { t } = useTranslation();
    const contacts = data || [];

    const handleEdit = () => {
        onEdit('contacts', contacts);
    };

    return (
        <div className="card-400">
            <h2>{t('member.contacts.label')}</h2>
            <div className="card-container">
                <EditButton onClick={handleEdit} />
                {contacts.length === 0 ? (
                    <p>{t('member.contacts.no_contacts')}</p>
                ) : (
                    contacts.map((contact) => (
                        <ContactDetail
                            key={contact.id}
                            label={t(`member.contacts.${contact.contact_type}`)}
                            name={contact.name}
                            contact={contact.phone}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default memo(MemberContactsCard);