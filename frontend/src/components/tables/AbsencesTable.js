import { useTranslation } from 'react-i18next'
import { Link } from 'react-router';
import { formatDate, formatStatus } from '../../utils/formatUtils';
import { colorAbsence, colorBoolean } from '../../utils/colorUtils';
import NameDisplay from '../layout/NameDisplay';

const AbsencesTable = ({ registry }) => {
    const { t } = useTranslation()

    return (
        <table className="registry-table">
        <thead>
            <tr>
                <th style={{ width: '30%' }}>{t('registry.table.member')}</th>
                <th style={{ width: '15%' }}>{t('registry.table.start_date')}</th>
                <th style={{ width: '15%' }}>{t('registry.table.end_date')}</th>
                <th style={{ width: '15%' }}>{t('registry.table.reason')}</th>
                <th style={{ width: '15%' }}>{t('registry.table.status')}</th>
                <th style={{ width: '10%' }}>{t('registry.table.called')}</th>
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
                <td>{formatDate(entry.start_date)}</td>
                <td>{formatDate(entry.end_date) || 'N/A'}</td>
                <td>{t(`member.absences.${entry.absence_type}`)}</td>
                <td>{colorAbsence(formatStatus(entry.start_date, entry.end_date), t)}</td>
                <td>{colorBoolean(entry.called, t)}</td>
            </tr>
            ))}
        </tbody>
        </table>
    );
};

export default AbsencesTable;