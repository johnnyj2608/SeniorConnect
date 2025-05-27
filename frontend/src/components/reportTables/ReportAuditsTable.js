import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';
import { colorAudit } from '../../utils/colorUtils';

const ReportAuditsTable = ({ report }) => {

    return (
        <table className="report-table">
        <thead>
            <tr>
                <th style={{ width: '30%' }}>Member</th>
                <th style={{ width: '15%' }}>Action</th>
                <th style={{ width: '20%' }}>Change</th>
                <th style={{ width: '20%' }}>User</th>
                <th style={{ width: '15%' }}>Date</th>
            </tr>
        </thead>
        <tbody>
            {report.map((entry) => {

                return (
                    <tr key={entry.id}>
                        <td>
                            <Link to={`/member/${entry.member}`} className="report-link">
                                {entry.member_name}
                             </Link>
                        </td>
                        <td>{colorAudit(entry.action_type)}</td>
                        <td>{entry.model_name}</td>
                        <td>{entry.user_name}</td>
                        <td>{formatDate(entry.timestamp)}</td>
                    </tr>
                );
            })}
        </tbody>
        </table>
    );
};

export default ReportAuditsTable;