const colorBoolean = (status) => {
    if (status) {
        return <span className="green">Yes</span>
    } else {
        return <span className="red">No</span>
    }
};

const colorAbsence = (status) => {
    switch (status) {
        case 'Ongoing':
            return (
            <>
                <span className="green">Ongoing</span>
            </>
            );
        case 'Completed':
            return (
            <>
                <span>Completed</span>
            </>
            );
        case 'Upcoming':
            return (
            <>
                <span className="orange">Upcoming</span>
            </>
            );
        default:
            return null;
    }
};

const colorEnrollment = (status, old_mltc, new_mltc) => {
    switch (status) {
        case 'Enrollment':
            return (
            <>
                <span className="green">Enrolled:</span> {new_mltc}
            </>
            );
        case 'Disenrollment':
            return (
            <>
                <span className="red">Disenrolled:</span> {old_mltc}
            </>
            );
        case 'Transfer':
            return (
            <>
                <span className="orange">Transferred:</span> {old_mltc} → {new_mltc}
            </>
            );
        default:
            return null;
    }
};

const colorAudit = (status) => {
    switch (status) {
        case 'Create':
            return (
            <>
                <span className="green">Create</span>
            </>
            );
        case 'Delete':
            return (
            <>
                <span className="red">Delete</span>
            </>
            );
        case 'Update':
            return (
            <>
                <span className="orange">Update</span>
            </>
            );
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