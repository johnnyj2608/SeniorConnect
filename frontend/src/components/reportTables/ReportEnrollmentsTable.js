import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';
import { formatEnrollmentStatus } from '../../utils/statusUtils';

const ReportEnrollmentsTable = ({ report }) => {

    return (
        <table className="report-table">
        <thead>
            <tr>
                <th style={{ width: '40%' }}>Member</th>
                <th style={{ width: '40%' }}>Status</th>
                <th style={{ width: '20%' }}>Date</th>
            </tr>
        </thead>
        <tbody>
            {report.map((entry) => {
                const { change_type, old_mltc, new_mltc } = entry;

                return (
                    <tr key={entry.id}>
                        <td>
                            <Link to={`/member/${entry.member}`} className="report-link">
                                {entry.sadc_member_id}. {entry.member_name}
                             </Link>
                        </td>
                        <td>{formatEnrollmentStatus(change_type, old_mltc, new_mltc)}</td>
                        <td>{formatDate(entry.created_at)}</td>
                    </tr>
                );
            })}
        </tbody>
        </table>
    );
};

export default ReportEnrollmentsTable;