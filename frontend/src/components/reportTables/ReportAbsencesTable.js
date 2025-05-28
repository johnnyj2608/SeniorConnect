import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';
import { colorAbsence, colorBoolean } from '../../utils/colorUtils';

const ReportAbsencesTable = ({ report }) => {

    return (
        <table className="report-table">
        <thead>
            <tr>
                <th>Member</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Called</th>
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
                <td>{entry.absence_type}</td>
                <td>{colorAbsence(entry.status, true)}</td>
                <td>{colorBoolean(entry.called)}</td>
            </tr>
            ))}
        </tbody>
        </table>
    );
};

export default ReportAbsencesTable;