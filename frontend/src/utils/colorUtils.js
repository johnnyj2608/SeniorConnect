const colorBoolean = (status, t) => {
    return status
        ? <span className="green">{t('general.yes')}</span>
        : <span className="red">{t('general.no')}</span>;
};

const colorAbsence = (status, t) => {
    switch (status) {
        case 'ongoing':
            return <span className="green">{t('reports.absences.ongoing')}</span>;
        case 'completed':
            return <span>{t('reports.absences.completed')}</span>;
        case 'upcoming':
            return <span className="yellow">{t('reports.absences.upcoming')}</span>;
        default:
            return null;
    }
};

const colorEnrollment = (status, old_mltc, new_mltc, t) => {
    switch (status) {
        case 'enrollment':
            return (
                <>
                    <span className="green">{t('reports.enrollments.enrollment')}:</span> {new_mltc}
                </>
            );
        case 'disenrollment':
            return (
                <>
                    <span className="red">{t('reports.enrollments.disenrollment')}:</span> {old_mltc}
                </>
            );
        case 'transfer':
            return (
                <>
                    <span className="yellow">{t('reports.enrollments.transfer')}:</span> {old_mltc} → {new_mltc}
                </>
            );
        default:
            return null;
    }
};

const colorAudit = (status, t) => {
    switch (status) {
        case 'create':
            return <span className="green">{t('reports.audit_log.create')}</span>;
        case 'delete':
            return <span className="red">{t('reports.audit_log.delete')}</span>;
        case 'update':
            return <span className="yellow">{t('reports.audit_log.update')}</span>;
        default:
            return null;
    }
};

const colorStats = (count, change) => {
    let percentChange;
    if (count - change === 0) {
        percentChange = count * 100;
    } else {
        percentChange = Math.round((change / (count - change)) * 100);
    }

    if (change > 0) {
        return <span className="green outline">↑ +{count} ({percentChange}%)</span>;
    } else if (change < 0) {
        return <span className="red outline">↓ -{count} ({percentChange}%)</span>;
    } else {
        return <span>(0%)</span>;
    }
};

export {
    colorAbsence,
    colorBoolean,
    colorEnrollment,
    colorAudit,
    colorStats,
};