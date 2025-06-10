import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import EditButton from '../buttons/EditButton';
import MemberDetail from '../layout/MemberDetail';
import ListDetail from '../layout/ListDetail';
import ContactDetail from '../layout/ContactDetail';
import { formatDate, formatSchedule } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import viewFile from '../../utils/viewFile';

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
                        <MemberDetail label={t('member.authorizations.mltc')} value={auth.mltc} />
                        <MemberDetail label={t('member.authorizations.mltc_member_id')} value={auth.mltc_member_id} />
                        <MemberDetail label={t('member.authorizations.start_date')} value={formatDate(auth.start_date)} />
                        <MemberDetail label={t('member.authorizations.end_date')} value={formatDate(auth.end_date)} />
                        <MemberDetail label={t('member.authorizations.dx_code')} value={auth.dx_code} />
                        <ListDetail label={t('member.authorizations.schedule')} value={formatSchedule(auth.schedule)} />
                        
                        {auth.services
                            .filter(service => service.id)
                            .map((service) => (
                                <div key={service.id} className="member-box">
                                    <label className="member-box-label">{t(`member.authorizations.${service.service_type}`)}</label>
                                    <div className="member-box-list card-full">
                                        <MemberDetail label={t('member.authorizations.auth_id')} value={service.auth_id} />
                                        <MemberDetail label={t('member.authorizations.service_code')} value={service.service_code} />
                                        <MemberDetail label={t('member.authorizations.service_units')} value={service.service_units} />
                                    </div>
                                </div>
                        ))}
                        <ContactDetail
                            label={t(`member.authorizations.care_manager`)}
                            name={auth.cm_name}
                            phone={auth.cm_phone}
                        />

                        {auth.file && (
                            <button 
                                className="action-button thin long"
                                onClick={() => viewFile(auth.file)}
                            >
                                {t('member.authorizations.view_auth')}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default memo(MemberAuthCard);