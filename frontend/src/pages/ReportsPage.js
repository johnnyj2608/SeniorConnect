import React, { useState } from 'react';
import RefreshButton from '../components/buttons/RefreshButton';
import PaginationButtons from '../components/buttons/PaginationButtons';
import ReportAbsencesTable from '../components/reportTables/ReportAbsencesTable';
import ReportAuditsTable from '../components/reportTables/ReportAuditsTable';
import ReportEnrollmentsTable from '../components/reportTables/ReportEnrollmentsTable';
import useFilteredReports from '../hooks/useFilteredReports';

const reportTypes = [
    'Absences', 
    'Audit Log', 
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
        'Disenrollment'
    ],
    'Audit Log': [
        'Create', 
        'Update', 
        'Delete'
    ],
};

const ReportsPage = () => {
    const [reportType, setReportType] = useState('Absences');
    const [reportFilter, setReportFilter] = useState('');

    const {
        report,
        currentPage,
        totalPages,
        setCurrentPage,
        fetchReport
    } = useFilteredReports(reportType, reportFilter);

    const getReportContent = () => {
        switch (reportType) {
            case 'Absences':
                return <ReportAbsencesTable key={currentPage} report={report} />;
            case 'Enrollments':
                return <ReportEnrollmentsTable key={currentPage} report={report} />;
            case 'Audit Log':
                return <ReportAuditsTable key={currentPage} report={report} />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="page-header">
                <div className="page-title-row">
                    <h2 className="page-title">&#9782; Reports</h2>
                    <RefreshButton onClick={fetchReport} />
                </div>
                <div className="filter-row">
                    <div className="filter-content">
                        <div className="filter-option">
                            <label>Report Type</label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
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
                                onChange={(e) => setReportFilter(e.target.value)}
                            >
                                <option value="">Select an option</option>
                                {reportFilters[reportType]?.map((filterOption) => (
                                    <option key={filterOption} value={filterOption}>
                                        {filterOption}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <PaginationButtons
                            currentPage={currentPage}
                            totalPages={totalPages}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                    <p className="members-count">
                        {report.length} {report.length === 1 ? 'result' : 'results'}
                    </p>
                </div>
            </div>

            <div className="reports-content content-padding">
                {report.length > 0 && getReportContent()}
            </div>
        </>
    );
};

export default ReportsPage;