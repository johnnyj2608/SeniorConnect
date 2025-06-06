import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import EditButton from '../buttons/EditButton';
import DetailRow from '../layout/MemberDetail';
import DetailListRow from '../layout/DetailListRow';
import { formatDate, formatSchedule } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const MemberAuthCard = ({ id, data, onEdit }) => {
    const { t } = useTranslation();
    const auth = data || {};

    const handleEdit = async () => {
        try {
            const response = await fetchWithRefresh(`/core/auths/member/${id}`);
            if (!response.ok) return;

            const auths = await response.json();
            onEdit('authorizations', auths);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="card-400">
            <h2>{t('member.authorizations.label')}</h2>
            <div className="card-container">
                <EditButton onClick={handleEdit} />
                {Object.keys(auth).length === 0 ? (
                    <p>{t('member.authorizations.no_authorization')}</p>
                ) : (
                    <>
                        <DetailRow label={t('member.authorizations.mltc')} value={auth.mltc} />
                        <DetailRow label={t('member.authorizations.mltc_member_id')} value={auth.mltc_member_id} />
                        <DetailRow label={t('member.authorizations.start_date')} value={formatDate(auth.start_date)} />
                        <DetailRow label={t('member.authorizations.end_date')} value={formatDate(auth.end_date)} />
                        <DetailRow label={t('member.authorizations.dx_code')} value={auth.dx_code} />
                        <DetailListRow label={t('member.authorizations.schedule')} value={formatSchedule(auth.schedule)} />
                        {/* Show services */}
                    </>
                )}
            </div>
        </div>
    );
};

export default memo(MemberAuthCard);