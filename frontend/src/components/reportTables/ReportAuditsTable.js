import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import DropdownButton from '../buttons/DropdownButton';
import { formatDate } from '../../utils/formatUtils';
import { colorAudit } from '../../utils/colorUtils';

const ReportAuditsTable = ({ report }) => {
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
                <th>Member</th>
                <th>Change</th>
                <th>Action</th>
                <th>User</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            {report.map((entry) => {
                const isExpanded = !!expandedRows[entry.id];
                const showDropdown = entry.action_type === 'Update' && entry.changes && Object.keys(entry.changes).length > 0;

                return (
                    <Fragment key={entry.id}>
                        <tr className={isExpanded ? 'expanded' : ''}>
                            <td>
                                <Link to={`/member/${entry.member}`} className="report-link">
                                {entry.member_name}
                                </Link>
                            </td>
                            <td>{entry.model_name}</td>
                            <td>
                                <span className="report-dropdown">
                                    {colorAudit(entry.action_type)}{' '}
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

                        {isExpanded && entry.changes && (
                        <tr>
                            <td colSpan={5}>
                                <span className="modal-main">
                                    ↪<pre>{' '+entry.changes}</pre>
                                </span>
                            </td>
                        </tr>
                        )}
                    </Fragment>
                );
            })}
        </tbody>
        </table>
    );
};

export default ReportAuditsTable;