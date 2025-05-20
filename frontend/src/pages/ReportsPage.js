import React, { useState, useEffect, useMemo } from 'react';
import DownloadButton from '../components/buttons/DownloadButton';
import { ReactComponent as ArrowLeft } from '../assets/arrow-left.svg'
import { ReactComponent as ArrowRight } from '../assets/arrow-right.svg'
import ReportAbsencesTable from '../components/reportTables/ReportAbsencesTable';
import ReportEnrollmentsTable from '../components/reportTables/ReportEnrollmentsTable';

const reportTypes = [
    'Absences',
    'Enrollments',
];

const reportFilters = {
    Absences: [
        'Ongoing',
        'Upcoming',
        'Completed'
    ],
    Enrollments: [
        'Enrollment',
        'Transfer',
        'Disenrollment',
    ],
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
            if (reportType === 'Absences') {
                endpoint = 'absences';
            } else if (reportType === 'Enrollments') {
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

        if (reportType === 'Absences') {
            const now = new Date();
            return report.filter(absence => {
                const start = new Date(absence.start_date);
                const end = absence.end_date ? new Date(absence.end_date) : null;

                switch(reportFilter) {
                    case 'Ongoing':
                        return start <= now && (!end || end >= now);
                    case 'Upcoming':
                        return start > now;
                    case 'Completed':
                        return end && end < now;
                    default:
                        return true;
                }
            });
        }

        if (reportType === 'Enrollments') {
            return report.filter(entry => entry.change_type === reportFilter);
        }

        return report;
    }, [report, reportFilter, reportType]);

    const getReportContent = () => {
        switch (reportType) {
            case 'Absences':
                return <ReportAbsencesTable report={filteredReport} />;
            case 'Enrollments':
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
                            <select 
                                value={reportType} 
                                onChange={(e) => setReportType(e.target.value)}>
                            <option value="">Select an option</option>
                            {reportTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                            </select>
                        </div>

                        <div className="filter-option">
                            <label>Status Filter</label>
                            <select
                                value={reportFilter}
                                onChange={(e) => setReportFilter(e.target.value)}>
                            <option value="">Select an option</option>
                            {reportFilters[reportType]?.map((filterOption) => (
                                <option key={filterOption} value={filterOption}>
                                    {filterOption}
                                </option>
                            ))}
                            </select>
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