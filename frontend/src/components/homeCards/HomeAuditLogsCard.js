import React, { useState, useEffect } from 'react';
import AuditItem from '../items/AuditItem';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import { formatDate } from '../../utils/formatUtils';

const HomeAuditLogsCard = () => {
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const getAudits = async () => {
      try {
        const response = await fetchWithRefresh('/audit/audits/recent/');
        if (!response.ok) return;

        const data = await response.json();
        setAuditLogs(data);
      } catch (error) {
        console.log('Failed to fetch audit logs:', error);
      }
    };

    getAudits();
  }, []);

  return (
    <div className="full-card">
      <h3>Audit Log</h3>
      <div className="card-container">
        {auditLogs.length === 0 ? (
          <p>No recent audits.</p>
        ) : (
          auditLogs.map(({ date, audits }) => (
            <div key={date} className="audit-group">
              <h4>{formatDate(date)}</h4>
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