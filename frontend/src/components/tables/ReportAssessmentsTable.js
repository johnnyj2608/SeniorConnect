import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '../../utils/formatUtils';
import NameDisplay from '../layout/NameDisplay';

const ReportAssesmentsTable = ({ report }) => {
    const { t } = useTranslation()

    return (
        <table className="report-table">
        <thead>
            <tr>
                <th style={{ width: '30%' }}>{t('reports.table.member')}</th>
                <th style={{ width: '20%' }}>{t('reports.table.user')}</th>
                <th style={{ width: '25%' }}>{t('reports.table.start_date')}</th>
                <th style={{ width: '25%' }}>{t('reports.table.time')}</th>
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
                <td>{entry.user_name}</td>
                <td>{formatDate(entry.start_date)}</td>
                <td>{formatTime(entry.time)}</td>
            </tr>
            ))}
        </tbody>
        </table>
    );
};

export default ReportAssesmentsTable;