import React, { useState, useEffect } from 'react';
import DownloadButton from '../components/buttons/DownloadButton';
import Dropdown from '../components/inputs/Dropdown';
import { report_types } from '../utils/mapUtils';
import { ReactComponent as ArrowLeft } from '../assets/arrow-left.svg'
import { ReactComponent as ArrowRight } from '../assets/arrow-right.svg'
import ReportAbsencesTable from '../components/reportTables/ReportAbsencesTable';
import ReportEnrollmentsTable from '../components/reportTables/ReportEnrollmentsTable';

const reportTypes = [
    { name: 'Absences', value: 'absences' },
    // { name: 'Audit Log', value: 'audit_log' },
    { name: 'Enrollments', value: 'enrollments' },
];

const ReportsPage = () => {
    const [report, setReport] = useState([]);
    const [reportType, setReportType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setReport([]);
        setTotalPages(1);
        setCurrentPage(1);
    }, [reportType]);

    useEffect(() => {
        const fetchReport = async () => {
            let endpoint;
            if (reportType === 'absences') {
                endpoint = 'absences'
            } else if (reportType === 'enrollments') {
                endpoint = 'enrollments'
            } else {
                return;
            }
            const response = await fetch(`/core/${endpoint}/?page=${currentPage}`);
            const data = await response.json();
            setReport(data.results);
            setTotalPages(Math.ceil(data.count / 20));
        };
      
        if (reportType) {
            fetchReport();
        }
    }, [reportType, currentPage]);

    const getReportContent = () => {
        switch (reportType) {
            case 'absences':
                return <ReportAbsencesTable report={report} />;
            case 'enrollments':
                return <ReportEnrollmentsTable report={report} />;
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
                        <DownloadButton membersByMltc={report} />
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
                        {report.length} {report.length === 1 ? 'result' : 'results'}
                    </p>
                </div>
            </div>
            
            <div className="report-results">
                {report.length > 0 && getReportContent()}
            </div>
        </>
    );
};

export default ReportsPage;