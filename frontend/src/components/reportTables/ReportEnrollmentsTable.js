import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';
import { colorEnrollment } from '../../utils/colorUtils';
import NameDisplay from '../layout/NameDisplay';

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
                const { change_type, old_mltc_name, new_mltc_name } = entry;

                return (
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
                        <td>{colorEnrollment(change_type, old_mltc_name, new_mltc_name, t)}</td>
                        <td>{formatDate(entry.change_date)}</td>
                    </tr>
                );
            })}
        </tbody>
        </table>
    );
};

export default ReportEnrollmentsTable;