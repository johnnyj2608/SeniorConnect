const contact_types = {
    emergency: 'Emergency Contact',
    primary_provider: 'Primary Care Provider',
    pharmacy: 'Pharmacy',
    home_aid: 'Home Aid',
    home_care: 'Home Care',
    other: 'Other',
};

const relationship_types = {
    husband: 'Husband',
    wife: 'Wife',
    son: 'Son',
    daughter: 'Daughter',
    brother: 'Brother',
    sister: 'Sister',
    friend: 'Friend',
    father: 'Father',
    mother: 'Mother',
    other: 'Other',
};

const absence_types = {
    vacation: 'Vacation',
    hospital: 'Hospital',
    personal: 'Personal',
    other: 'Other',
};

const report_types = {
    absences: 'Absences',
    audit_log: 'Audit Log',
    enrollment: 'Enrollment',
};

const absence_status = {
    ongoing: 'Ongoing',
    upcoming: 'Upcoming',
    completed: 'Completed',
}

const enrollment_status = {
    enrollment: 'Enrollment',
    transfer: 'Transfer',
    disenrollment: 'Disenrollment',
}

export {
    contact_types,
    relationship_types,
    absence_types,
    report_types,
    absence_status,
    enrollment_status,
};