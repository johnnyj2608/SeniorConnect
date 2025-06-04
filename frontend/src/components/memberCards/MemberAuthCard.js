import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import EditButton from '../buttons/EditButton';
import DetailRow from '../layout/MemberDetail';
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
        <div className="half-card">
            <h2>{t('member.authorization.label')}</h2>
            <div className="card-container">
                <EditButton onClick={handleEdit} />
                {Object.keys(auth).length === 0 ? (
                    <p>{t('member.authorization.no_authorization')}</p>
                ) : (
                    <>
                        <DetailRow label={t('member.authorization.mltc_member_id')} value={auth.mltc_member_id} />
                        <DetailRow label={t('member.authorization.mltc')} value={auth.mltc} />
                        <DetailRow label={t('member.authorization.mltc_auth_id')} value={auth.mltc_auth_id} />
                        <DetailRow label={t('member.authorization.schedule')} value={formatSchedule(auth.schedule)} />
                        <DetailRow label={t('member.authorization.start_date')} value={formatDate(auth.start_date)} />
                        <DetailRow label={t('member.authorization.end_date')} value={formatDate(auth.end_date)} />
                        <DetailRow label={t('member.authorization.dx_code')} value={auth.dx_code} />
                        <DetailRow label={t('member.authorization.sdc_code')} value={auth.sdc_code} />
                        <DetailRow label={t('member.authorization.trans_code')} value={auth.trans_code} />
                    </>
                )}
            </div>
        </div>
    );
};

export default memo(MemberAuthCard);