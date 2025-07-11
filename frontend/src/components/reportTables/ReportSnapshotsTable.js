import { useTranslation } from 'react-i18next'
import OpenSaveButtons from '../buttons/OpenSaveButtons';
import { formatDate } from '../../utils/formatUtils';

const ReportSnapshotsTable = ({ report }) => {
    const { t } = useTranslation()

    return (
        <table className="report-table">
        <thead>
            <tr>
                <th style={{ width: '25%' }}>{t('reports.table.date')}</th>
                <th style={{ width: '35%' }}>{t('reports.table.type')}</th>
                <th style={{ width: '20%' }}>{t('reports.table.size')}</th>
                <th style={{ width: '20%' }}>{t('reports.table.open_or_save')}</th>
            </tr>
        </thead>
        <tbody>
            {report.map((entry) => (
            <tr key={entry.id}>
                <td>{formatDate(entry.date)}</td>
                <td> {t(`reports.snapshots.${entry.type}`)}</td>
                <td>{entry.pages} {entry.pages === 1 ? 'Page' : 'Pages'}</td>
                <td><OpenSaveButtons file={entry.file} /></td>
            </tr>
            ))}
        </tbody>
        </table>
    );
};

export default ReportSnapshotsTable;