import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';
import { formatAbsenceStatus } from '../../utils/statusUtils';

const ReportAbsencesTable = ({ report }) => {

    return (
        <table className="report-table">
        <thead>
            <tr>
                <th style={{ width: '30%' }}>Member</th>
                <th style={{ width: '15%' }}>Start Date</th>
                <th style={{ width: '15%' }}>End Date</th>
                <th style={{ width: '15%' }}>Reason</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '10%' }}>Note</th>
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
                <td>{entry.entry_type}</td>
                <td>{formatAbsenceStatus(entry.start_date, entry.end_date, true)}</td>
                <td>{entry.note}</td>
            </tr>
            ))}
        </tbody>
        </table>
    );
};

export default ReportAbsencesTable;