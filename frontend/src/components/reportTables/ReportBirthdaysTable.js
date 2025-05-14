import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';

const BirthdayReportTable = ({ report }) => {
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th style={{ width: '35%' }}>Member</th>
          <th style={{ width: '15%' }}>Birth Date</th>
          <th style={{ width: '50%' }}>Countdown</th>
        </tr>
      </thead>
      <tbody>
        {report.map((member) => (
          <tr key={member.id}>
            <td>
              <Link to={`/member/${member.id}`} className="report-link">
                {member.sadc_member_id}. {member.last_name}, {member.first_name} 
              </Link>
            </td>
            <td>{formatDate(member.birth_date)}</td>
            <td>Turns {member.age_on_birthday} in {member.days_until_birthday} days</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BirthdayReportTable;
