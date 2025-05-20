import React from "react";

const formatAbsenceStatus = (start_date, end_date, color=false) => {
  const today = new Date();

  const start = start_date ? new Date(start_date) : null;
  const end = end_date ? new Date(end_date) : null;

  if (!start) {
        return '';
    } else if (start > today) {
        return color
        ? <span className="orange">Upcoming</span>
        : 'Upcoming';
    } else if (end && end < today) {
        return <span>Completed</span>
    } else if (start <= today && (!end || end >= today)) {
        return color
        ? <span className="green">Ongoing</span>
        : 'Ongoing';
    } else {
        return '';
    }
    };

const formatEnrollmentStatus = (change_type, old_mltc, new_mltc) => {
    switch (change_type) {
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

const formatChangeStatus = (count, change) => {
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
    formatAbsenceStatus,
    formatEnrollmentStatus,
    formatChangeStatus,
};