import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import ContactDetail from '../layout/ContactDetail';
import CardMember from '../layout/CardMember';

const MemberContactCard = ({ data, onEdit }) => {
    const { t } = useTranslation();
    const contacts = data || [];

    return (
        <CardMember
            title={t('member.contacts.label')}
            data={contacts}
            emptyMessage={t('member.contacts.no_contacts')}
            onEdit={onEdit}
            editKey="contacts"
        >
            {contacts.map(contact => (
                <ContactDetail
                    key={contact.id}
                    label={t(`member.contacts.${contact.contact_type}`)}
                    name={contact.name}
                    contact={contact.phone}
                />
            ))}
        </CardMember>
    );
};

export default memo(MemberContactCard);