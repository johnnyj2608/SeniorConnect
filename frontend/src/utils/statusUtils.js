import React from "react";

const formatAbsenceStatus = (start_date, end_date) => {
    const today = new Date();

    const start = new Date(start_date) || null;
    const end = new Date(end_date) || null;

    if (start === null) {
        return '';
    } else if (start > today) {
        return <span className="orange">Upcoming</span>;
    } else if (end && end < today) {
        return <span>Expired</span>;
    } else if (start <= today && (end === null || end >= today)) {
        return <span className="green">Ongoing</span>;
    } else {
        return '';
    }
}

const formatEnrollmentStatus = (change_type, old_mltc, new_mltc) => {
    switch (change_type) {
    case 'enrollment':
        return (
        <>
            <span className="green">Enrolled:</span> {new_mltc}
        </>
        );
    case 'disenrollment':
        return (
        <>
            <span className="red">Disenrolled:</span> {old_mltc}
        </>
        );
    case 'transfer':
        return (
        <>
            <span className="orange">Transferred:</span> {old_mltc} → {new_mltc}
        </>
        );
    default:
        return null;
    }
};

export {
    formatAbsenceStatus,
    formatEnrollmentStatus,
};