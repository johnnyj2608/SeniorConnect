import React, { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import CardHome from '../layout/CardHome';
import NameDisplay from '../layout/NameDisplay';

const HomeAuditLogsCard = () => {
    const { t } = useTranslation();
    const [auditLogs, setAuditLogs] = useState([]);

    useEffect(() => {
        const getAudits = async () => {
            try {
                const response = await fetchWithRefresh('/audit/audits/recent/');
                if (!response.ok) return;

                const data = await response.json();
                setAuditLogs(data);
            } catch (error) {
                console.error(error);
            }
        };

        getAudits();
    }, []);

    return (
        <CardHome
            title={t('home.audit_log')}
            data={auditLogs}
            emptyMessage={t('home.no_recent_audits')}
        >
            {auditLogs.map(({ date, audits }) => (
                <div key={date} className="audit-group">
                    <h3>{formatDate(date)}</h3>
                    <ul>
                        {audits.map(audit => (
                            <AuditItem key={audit.id} audit={audit} />
                        ))}
                    </ul>
                </div>
            ))}
        </CardHome>
    );
};

export default HomeAuditLogsCard;

const AuditItem = memo(({ audit }) => {
    const { t } = useTranslation();

    return (
        <li>
            <Link to={`/members/${audit.member_id}`} className="home-item">
                <span className="home-item-primary">
                    <p>
                        <NameDisplay
                            sadcId={audit.sadc_member_id}
                            memberName={audit.member_name}
                            altName={audit.alt_name}
                        />
                    </p>
                    <p>— {audit.user_name}</p>
                </span>
                <span className="home-item-secondary">
                    <p>{t(`home.${audit.action_type}`)}</p>
                    <p>{t(`model.${audit.model_name}`)}</p>
                </span>
            </Link>
        </li>
    );
});