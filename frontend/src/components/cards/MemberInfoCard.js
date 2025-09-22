import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import MemberDetail from '../layout/MemberDetail';
import ContactDetail from '../layout/ContactDetail';
import { formatDate, formatGender, formatPhone, formatSSN } from '../../utils/formatUtils';
import CardMember from '../layout/CardMember';

const MemberInfoCard = ({ data, onEdit }) => {
    const { t } = useTranslation();
    const info = data || {};

    return (
        <CardMember
            title={t('member.info.label')}
            data={info}
            emptyMessage={t('member.info.no_info')}
            onEdit={onEdit}
            editKey="info"
        >
            <MemberDetail label={t('member.info.sadc_member_id')} value={info.sadc_member_id} />
            <MemberDetail label={t('member.info.last_name')} value={info.last_name} />
            <MemberDetail label={t('member.info.first_name')} value={info.first_name} />
            <MemberDetail label={t('member.info.alt_name')} value={info.alt_name} />
            <MemberDetail label={t('member.info.birth_date')} value={formatDate(info.birth_date)} />
            <MemberDetail label={t('member.info.gender')} value={formatGender(info.gender)} />
            <MemberDetail label={t('member.info.phone')} value={formatPhone(info.phone)} />
            <MemberDetail label={t('member.info.address')} value={info.address} />
            <ContactDetail label={t('member.info.email')} name={info.email} email={true} />
            <MemberDetail label={t('member.info.medicaid')} value={info.medicaid?.toUpperCase()} />
            <MemberDetail label={t('member.info.ssn')} value={formatSSN(info.ssn)} />
            <MemberDetail label={t('member.info.language')} value={info.language} />
            <MemberDetail label={t('member.info.enrollment')} value={formatDate(info.enrollment_date)} />
            <MemberDetail label={t('general.note')} value={info.note} />
        </CardMember>
    );
};

export default memo(MemberInfoCard);