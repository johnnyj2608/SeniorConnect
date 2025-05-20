import { Link } from 'react-router-dom';
import { absence_types } from '../../utils/mapUtils';
import { formatDate } from '../../utils/formatUtils';
import { formatAbsenceStatus } from '../../utils/statusUtils';

const ReportAbsencesTable = ({ report }) => {

    return (
        <table className="report-table">
        <thead>
            <tr>
                <th style={{ width: '35%' }}>Member</th>
                <th style={{ width: '15%' }}>Start Date</th>
                <th style={{ width: '15%' }}>End Date</th>
                <th style={{ width: '10%' }}>Reason</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '15%' }}>Note</th>
            </tr>
        </thead>
        <tbody>
            {report.map((absence) => (
            <tr key={absence.id}>
                <td>
                    <Link to={`/member/${absence.member}`} className="report-link">
                        {absence.sadc_member_id}. {absence.member_name}
                    </Link>
                </td>
                <td>{formatDate(absence.start_date)}</td>
                <td>{formatDate(absence.end_date) || 'N/A'}</td>
                <td>{absence_types[absence.absence_type]}</td>
                <td>{formatAbsenceStatus(absence.start_date, absence.end_date, true)}</td>
                <td>{absence.note}</td>
            </tr>
            ))}
        </tbody>
        </table>
    );
};

export default ReportAbsencesTable;