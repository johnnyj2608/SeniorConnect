import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DropdownButton from '../buttons/DropdownButton';
import { formatDate } from '../../utils/formatUtils';
import { colorAudit } from '../../utils/colorUtils';
import NameDisplay from '../layout/NameDisplay';
import ReportAuditsExpanded from './ReportAuditsExpanded';

const ReportAuditsTable = ({ report }) => {
    const { t } = useTranslation();
    const [expandedRows, setExpandedRows] = useState({});

    const toggleDetails = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <table className="report-table">
        <thead>
            <tr>
                <th style={{ width: '30%' }}>{t('reports.table.member')}</th>
                <th style={{ width: '15%' }}>{t('reports.table.change')}</th>
                <th style={{ width: '20%' }}>{t('reports.table.action')}</th>
                <th style={{ width: '20%' }}>{t('reports.table.user')}</th>
                <th style={{ width: '15%' }}>{t('reports.table.date')}</th>
            </tr>
        </thead>
        <tbody>
            {report.map((entry) => {
                const isExpanded = !!expandedRows[entry.id];
                const showDropdown = entry.action_type === 'update' && Object.keys(entry.changes).length > 0;

                return (
                    <Fragment key={entry.id}>
                        <tr className={isExpanded ? 'expanded' : ''}>
                            <td>
                                <Link to={`/member/${entry.member}`} className="report-link">
                                    <NameDisplay
                                        sadcId={entry.sadc_member_id}
                                        memberName={entry.member_name}
                                        altName={entry.alt_name}
                                    />
                                </Link>
                            </td>
                            <td>{t(`model.${entry.model_name}`, { defaultValue: '' })}</td>
                            <td>
                                <span className="report-dropdown">
                                    {colorAudit(entry.action_type, t)}{' '}
                                    {showDropdown && (
                                    <DropdownButton
                                        showDetails={isExpanded}
                                        toggleDetails={() => toggleDetails(entry.id)}
                                    />
                                    )}
                                </span>
                            </td>
                            <td>{entry.user_name}</td>
                            <td>{formatDate(entry.timestamp)}</td>
                        </tr>

                        {isExpanded && entry.changes && <ReportAuditsExpanded entry={entry} />}
                    </Fragment>
                );
            })}
        </tbody>
        </table>
    );
};

export default ReportAuditsTable;