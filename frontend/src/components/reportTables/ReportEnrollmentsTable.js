import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';
import { colorEnrollment } from '../../utils/colorUtils';

const ReportEnrollmentsTable = ({ report }) => {
    const { t } = useTranslation();

    return (
        <table className="report-table">
        <thead>
            <tr>
                <th style={{ width: '30%' }}>{t('reports.table.member')}</th>
                <th style={{ width: '55%' }}>{t('reports.table.status')}</th>
                <th style={{ width: '15%' }}>{t('reports.table.date')}</th>
            </tr>
        </thead>
        <tbody>
            {report.map((entry) => {
                const { change_type, old_mltc, new_mltc } = entry;

                return (
                    <tr key={entry.id}>
                        <td>
                            <Link to={`/member/${entry.member}`} className="report-link">
                                {entry.member_name}
                             </Link>
                        </td>
                        <td>{colorEnrollment(change_type, old_mltc, new_mltc, t)}</td>
                        <td>{formatDate(entry.change_date)}</td>
                    </tr>
                );
            })}
        </tbody>
        </table>
    );
};

export default ReportEnrollmentsTable;