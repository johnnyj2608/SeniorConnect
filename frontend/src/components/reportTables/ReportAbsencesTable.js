import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';
import { absence_types } from '../../utils/mapUtils';

const AbsenceReportTable = ({ report }) => {
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th style={{ width: '35%' }}>Member</th>
          <th style={{ width: '10%' }}>Start Date</th>
          <th style={{ width: '10%' }}>End Date</th>
          <th style={{ width: '20%' }}>Reason</th>
          <th style={{ width: '15%' }}>Note</th>
          <th style={{ width: '10%' }}>Created</th>
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
            <td>{absence.note}</td>
            <td>{formatDate(absence.created_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AbsenceReportTable;