import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom';
import { formatDate, formatStatus } from '../../utils/formatUtils';
import { colorAbsence, colorBoolean } from '../../utils/colorUtils';

const ReportAbsencesTable = ({ report }) => {
    const { t } = useTranslation()

    return (
        <table className="report-table">
        <thead>
            <tr>
                <th>{t('reports.table.member')}</th>
                <th>{t('reports.table.start_date')}</th>
                <th>{t('reports.table.end_date')}</th>
                <th>{t('reports.table.reason')}</th>
                <th>{t('reports.table.status')}</th>
                <th>{t('reports.table.called')}</th>
            </tr>
        </thead>
        <tbody>
            {report.map((entry) => (
            <tr key={entry.id}>
                <td>
                    <Link to={`/member/${entry.member}`} className="report-link">
                        {entry.member_name}
                    </Link>
                </td>
                <td>{formatDate(entry.start_date)}</td>
                <td>{formatDate(entry.end_date) || 'N/A'}</td>
                <td>{t(`member.absences.${entry.absence_type}`)}</td>
                <td>{colorAbsence(formatStatus(entry.start_date, entry.end_date), t)}</td>
                <td>{colorBoolean(entry.called, t)}</td>
            </tr>
            ))}
        </tbody>
        </table>
    );
};

export default ReportAbsencesTable;