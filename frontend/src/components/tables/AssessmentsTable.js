import { useTranslation } from 'react-i18next'
import { Link } from 'react-router';
import { formatDate, formatTime } from '../../utils/formatUtils';
import NameDisplay from '../layout/NameDisplay';

const AssessmentsTable = ({ registry }) => {
    const { t } = useTranslation()

    return (
        <table className="registry-table">
        <thead>
            <tr>
                <th style={{ width: '30%' }}>{t('registry.table.member')}</th>
                <th style={{ width: '20%' }}>{t('registry.table.user')}</th>
                <th style={{ width: '25%' }}>{t('registry.table.start_date')}</th>
                <th style={{ width: '25%' }}>{t('registry.table.time')}</th>
            </tr>
        </thead>
        <tbody>
            {registry.map((entry) => (
            <tr key={entry.id}>
                <td>
                    <Link to={`/members/${entry.member}`} className="registry-link">
                        <NameDisplay
                            sadcId={entry.sadc_member_id}
                            memberName={entry.member_name}
                            altName={entry.alt_name}
                        />
                    </Link>
                </td>
                <td>{entry.user_name}</td>
                <td>{formatDate(entry.start_date)}</td>
                <td>{formatTime(entry.time)}</td>
            </tr>
            ))}
        </tbody>
        </table>
    );
};

export default AssessmentsTable;