import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';
import { colorEnrollment } from '../../utils/colorUtils';
import NameDisplay from '../layout/NameDisplay';

const EnrollmentsTable = ({ registry }) => {
    const { t } = useTranslation();

    return (
        <table className="registry-table">
        <thead>
            <tr>
                <th style={{ width: '30%' }}>{t('registry.table.member')}</th>
                <th style={{ width: '55%' }}>{t('registry.table.status')}</th>
                <th style={{ width: '15%' }}>{t('registry.table.date')}</th>
            </tr>
        </thead>
        <tbody>
            {registry.map((entry) => {
                const { change_type, old_mltc, new_mltc } = entry;

                return (
                    <tr key={entry.id}>
                        <td>
                            <Link to={`/members/${entry.member_id}`} className="registry-link">
                                <NameDisplay
                                    sadcId={entry.sadc_member_id}
                                    memberName={entry.member_name}
                                    altName={entry.alt_name}
                                />
                            </Link>
                        </td>
                        <td>{colorEnrollment(change_type, old_mltc, new_mltc, t)}</td>
                        <td>{formatDate(entry.change_date)}</td>
                    </tr>
                );
            })}
        </tbody>
        </table>
    );
};

export default EnrollmentsTable;