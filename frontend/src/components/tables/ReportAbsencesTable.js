import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom';
import { formatDate, formatStatus } from '../../utils/formatUtils';
import { colorAbsence, colorBoolean } from '../../utils/colorUtils';
import NameDisplay from '../layout/NameDisplay';

const ReportAbsencesTable = ({ report }) => {
    const { t } = useTranslation()

    return (
        <table className="report-table">
        <thead>
            <tr>
                <th style={{ width: '30%' }}>{t('reports.table.member')}</th>
                <th style={{ width: '15%' }}>{t('reports.table.start_date')}</th>
                <th style={{ width: '15%' }}>{t('reports.table.end_date')}</th>
                <th style={{ width: '15%' }}>{t('reports.table.reason')}</th>
                <th style={{ width: '15%' }}>{t('reports.table.status')}</th>
                <th style={{ width: '10%' }}>{t('reports.table.called')}</th>
            </tr>
        </thead>
        <tbody>
            {report.map((entry) => (
            <tr key={entry.id}>
                <td>
                    <Link to={`/member/${entry.member}`} className="report-link">
                        <NameDisplay
                            sadcId={entry.sadc_member_id}
                            memberName={entry.member_name}
                            altName={entry.alt_name}
                        />
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