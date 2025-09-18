import { useTranslation } from 'react-i18next'
import OpenSaveButtons from '../buttons/OpenSaveButtons';
import { formatDate } from '../../utils/formatUtils';

const SnapshotsTable = ({ registry }) => {
    const { t } = useTranslation()

    return (
        <table className="registry-table">
        <thead>
            <tr>
                <th style={{ width: '25%' }}>{t('registry.table.date')}</th>
                <th style={{ width: '35%' }}>{t('registry.table.type')}</th>
                <th style={{ width: '20%' }}>{t('registry.table.size')}</th>
                <th style={{ width: '20%' }}>{t('registry.table.open_or_save')}</th>
            </tr>
        </thead>
        <tbody>
            {registry.map((entry) => (
            <tr key={entry.id}>
                <td>{formatDate(entry.date)}</td>
                <td> {t(`registry.snapshots.${entry.type}`)}</td>
                <td>{entry.pages} {entry.pages === 1 ? 'Page' : 'Pages'}</td>
                <td><OpenSaveButtons file={entry.file} name={entry.name} /></td>
            </tr>
            ))}
        </tbody>
        </table>
    );
};

export default SnapshotsTable;