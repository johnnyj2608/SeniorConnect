import React, { useState, useEffect, useMemo } from 'react';
import DownloadButton from '../components/buttons/DownloadButton';
import Dropdown from '../components/inputs/Dropdown';
import { report_types, absence_status, enrollment_status } from '../utils/mapUtils';
import { ReactComponent as ArrowLeft } from '../assets/arrow-left.svg'
import { ReactComponent as ArrowRight } from '../assets/arrow-right.svg'
import ReportAbsencesTable from '../components/reportTables/ReportAbsencesTable';
import ReportEnrollmentsTable from '../components/reportTables/ReportEnrollmentsTable';

const reportTypes = [
    { name: 'Absences', value: 'absences' },
    // { name: 'Audit Log', value: 'audit_log' },
    { name: 'Enrollments', value: 'enrollments' },
];

const reportFilters = {
    absences: [
      { name: 'Ongoing', value: 'ongoing' },
      { name: 'Upcoming', value: 'upcoming' },
      { name: 'Completed', value: 'completed' },
    ],
    enrollments: [
      { name: 'Enrollment', value: 'enrollment' },
      { name: 'Transfer', value: 'transfer' },
      { name: 'Disenrollment', value: 'disenrollment' },
    ],
};

const reportFiltersMap = {
    absences: absence_status,
    enrollments: enrollment_status,
};

const ReportsPage = () => {
    const [report, setReport] = useState([]);
    const [reportType, setReportType] = useState('');
    const [reportFilter, setReportFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setReport([]);
        setReportFilter('');
        setTotalPages(1);
        setCurrentPage(1);
    }, [reportType]);

    useEffect(() => {
        const fetchReport = async () => {
            if (!reportType) return;

            let endpoint;
            if (reportType === 'absences') {
                endpoint = 'absences';
            } else if (reportType === 'enrollments') {
                endpoint = 'enrollments';
            } else {
                return;
            }

            const response = await fetch(`/core/${endpoint}/?page=${currentPage}`);
            const data = await response.json();
            setReport(data.results);
            setTotalPages(Math.ceil(data.count / 20));
        };

        fetchReport();
    }, [reportType, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [reportFilter]);

    const filteredReport = useMemo(() => {
        if (!reportFilter) return report;

        if (reportType === 'absences') {
            const now = new Date();
            return report.filter(absence => {
                const start = new Date(absence.start_date);
                const end = absence.end_date ? new Date(absence.end_date) : null;

                switch(reportFilter) {
                    case 'ongoing':
                        return start <= now && (!end || end >= now);
                    case 'upcoming':
                        return start > now;
                    case 'completed':
                        return end && end < now;
                    default:
                        return true;
                }
            });
        }

        if (reportType === 'enrollments') {
            return report.filter(entry => entry.change_type === reportFilter);
        }

        return report;
    }, [report, reportFilter, reportType]);

    const getReportContent = () => {
        switch (reportType) {
            case 'absences':
                return <ReportAbsencesTable report={filteredReport} />;
            case 'enrollments':
                return <ReportEnrollmentsTable report={filteredReport} />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="page-header">
                <div className="page-title-row">
                    <h2 className="page-title">&#9782; Reports</h2>
                    <h2>
                        <DownloadButton membersByMltc={filteredReport} />
                    </h2>
                </div>
                <div className="filter-row">
                    <div className="filter-content">

                        <div className="filter-option">
                            <label>Report Type</label>
                            <Dropdown
                                display={report_types[reportType]}
                                onChange={(e) => setReportType(e.target.value)}
                                options={reportTypes}
                            />
                        </div>

                        <div className="filter-option">
                            <label>Status Filter</label>
                            <Dropdown
                                display={reportFiltersMap[reportType]?.[reportFilter] || ''}
                                onChange={(e) => setReportFilter(e.target.value)}
                                options={reportFilters[reportType]}
                            />
                        </div>

                        <div className="pagination-controls">
                            <button
                                className="arrow-btn"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ArrowLeft />
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button
                                className="arrow-btn"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                <ArrowRight />
                            </button>
                        </div>

                    </div>
                    <p className="members-count">
                        {filteredReport.length} {filteredReport.length === 1 ? 'result' : 'results'}
                    </p>
                </div>
            </div>
            
            <div className="report-results">
                {filteredReport.length > 0 && getReportContent()}
            </div>
        </>
    );
};

export default ReportsPage;