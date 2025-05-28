import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';
import { colorEnrollment } from '../../utils/colorUtils';

const ReportEnrollmentsTable = ({ report }) => {

    return (
        <table className="report-table">
        <thead>
            <tr>
                <th>Member</th>
                <th>Status</th>
                <th>Date</th>
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
                        <td>{colorEnrollment(change_type, old_mltc, new_mltc)}</td>
                        <td>{formatDate(entry.change_date)}</td>
                    </tr>
                );
            })}
        </tbody>
        </table>
    );
};

export default ReportEnrollmentsTable;