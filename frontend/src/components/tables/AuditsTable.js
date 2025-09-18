import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DropdownButton from '../buttons/DropdownButton';
import { formatDate, formatObjectDisplay, formatTime } from '../../utils/formatUtils';
import { colorAudit } from '../../utils/colorUtils';
import NameDisplay from '../layout/NameDisplay';

const AuditsTable = ({ registry }) => {
    const { t } = useTranslation();
    const [expandedRows, setExpandedRows] = useState({});

    const toggleDetails = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <table className="registry-table">
        <thead>
            <tr>
                <th style={{ width: '30%' }}>{t('registry.table.member')}</th>
                <th style={{ width: '15%' }}>{t('registry.table.change')}</th>
                <th style={{ width: '20%' }}>{t('registry.table.action')}</th>
                <th style={{ width: '20%' }}>{t('registry.table.user')}</th>
                <th style={{ width: '15%' }}>{t('registry.table.date')}</th>
            </tr>
        </thead>
        <tbody>
            {registry.map((entry) => {
                const isExpanded = !!expandedRows[entry.id];
                const showDropdown = entry.action_type === 'update' && Object.keys(entry.changes).length > 0;

                return (
                    <Fragment key={entry.id}>
                        <tr className={isExpanded ? 'expanded' : ''}>
                            <td>
                                <Link to={`/members/${entry.member_id}`} className="registry-link">
                                    <NameDisplay
                                        sadcId={entry.sadc_member_id}
                                        memberName={entry.member_name}
                                        altName={entry.alt_name}
                                    />
                                </Link>
                            </td>
                            <td>{t(`model.${entry.model_name}`, { defaultValue: '' })}</td>
                            <td>
                                <span className="registry-dropdown">
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

                        {isExpanded && entry.changes && <AuditsExpanded entry={entry} />}
                    </Fragment>
                );
            })}
        </tbody>
        </table>
    );
};

const AuditsExpanded = ({ entry }) => {
    const { t } = useTranslation();

    const baseKey = entry.model_name === 'member'
        ? 'info'
        : `${entry.model_name}s`;
  
    const translateBool = (val) => {
        if (val === true) return t('general.yes');
        if (val === false) return t('general.no');
        return val ?? '';
    };
  
    return (
        <tr>
            <td colSpan={5}>
                <span className="modal-main">
                    ↪&nbsp;<p>
                        {formatObjectDisplay(entry, t)}
                        {Object.entries(entry.changes).map(([field, { old, new: newVal }], i) => {
                            const label = t(`member.${baseKey}.${field}`);
            
                            const formatChange = (val) => {
                                if (val === null || val === undefined) return '';

                                const isTimeString = (v) => /^\d{2}:\d{2}:\d{2}$/.test(v);
                                const dateOnly = typeof val === 'string' && val.includes('T')
                                    ? val.split('T')[0]
                                    : val;

                                const date = new Date(dateOnly);

                                if (!isNaN(date) && dateOnly.length === 10) return formatDate(date);
                                if (isTimeString(val)) return formatTime(val);
                                return translateBool(val);
                            };

                            return (
                                <Fragment key={i}>
                                    • {label}: {formatChange(old)}
                                    {newVal !== null && newVal !== undefined && (
                                        <> → {formatChange(newVal)}</>
                                    )}
                                    <br />
                                </Fragment>
                            );
                        })}
                    </p>
                </span>
            </td>
        </tr>
    );
};

export default AuditsTable;