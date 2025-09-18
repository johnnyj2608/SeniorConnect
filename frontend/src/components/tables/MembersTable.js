import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NameDisplay from '../layout/NameDisplay';
import { formatDate, formatSchedule } from '../../utils/formatUtils';

const EnrollmentsTable = ({ registry }) => {
    const { t } = useTranslation();

    return (
        <table className="registry-table">
        <thead>
            <tr>
                <th style={{ width: '30%' }}>{t('registry.table.member')}</th>
                <th style={{ width: '10%' }}>{t('registry.table.birth_date')}</th>
                <th style={{ width: '40%' }}>{t('registry.table.mltc')}</th>
                <th style={{ width: '15%' }}>{t('registry.table.schedule')}</th>
                <th style={{ width: '5%' }}>{t('registry.table.days')}</th>
            </tr>
        </thead>
        <tbody>
            {registry.map((entry) => {

                return (
                    <tr key={entry.id}>
                        <td>
                            <Link to={`/members/${entry.id}`} className="registry-link">
                                <NameDisplay
                                    sadcId={entry.sadc_member_id}
                                    memberName={`${entry.last_name}, ${entry.first_name}`}
                                    altName={entry.alt_name}
                                />
                            </Link>
                        </td>
                        <td>{formatDate(entry.birth_date)}</td>
                        <td>{entry.mltc_name}</td>
                        <td>{formatSchedule(entry.schedule, true)}</td>
                        <td style={{ textAlign: 'center' }}>{entry.schedule?.length || 0}</td>
                    </tr>
                );
            })}
        </tbody>
        </table>
    );
};

export default EnrollmentsTable;