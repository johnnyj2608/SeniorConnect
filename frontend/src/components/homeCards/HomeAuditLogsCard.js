import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AuditItem from '../items/AuditItem';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import { formatDate } from '../../utils/formatUtils';

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
        console.log(error);
      }
    };

    getAudits();
  }, []);

  return (
    <div className="card-full">
      <h2>{t('home.audit_log')}</h2>
      <div className="card-container">
        {auditLogs.length === 0 ? (
          <p>{t('home.no_recent_audits')}</p>
        ) : (
          auditLogs.map(({ date, audits }) => (
            <div key={date} className="audit-group">
              <h3>{formatDate(date)}</h3>
              <ul>
                {audits.map((audit) => (
                  <AuditItem key={audit.id} audit={audit} />
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeAuditLogsCard;