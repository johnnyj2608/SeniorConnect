import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DownloadButton from '../components/buttons/DownloadButton';
import Dropdown from '../components/inputs/Dropdown';
import { formatDate } from '../utils/formatUtils';
import { report_types, absence_types } from '../utils/mapUtils';
import { ReactComponent as ArrowLeft } from '../assets/arrow-left.svg'
import { ReactComponent as ArrowRight } from '../assets/arrow-right.svg'

const reportTypes = [
    { name: 'Absences', value: 'absences' },
    { name: 'Birthdays', value: 'birthdays' },
    { name: 'Enrollment', value: 'enrollment' },
];

const ReportsPage = () => {
    const [report, setReport] = useState([]);
    const [reportType, setReportType] = useState('absences');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchReport = async () => {
          const response = await fetch(`/core/absences/?page=${currentPage}`);
          const data = await response.json();
          setReport(data.results);
          setTotalPages(Math.ceil(data.count / 25));
        };
      
        fetchReport();
    }, [reportType, currentPage]);

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
                                placeholder={false}
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
                                disabled={currentPage === totalPages}
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
                {report.length > 0 && (
                <table className="report-table">
                    <thead>
                        <tr>
                        <th style={{ width: '25%' }}>Member</th>
                        <th style={{ width: '15%' }}>Start Date</th>
                        <th style={{ width: '15%' }}>End Date</th>
                        <th style={{ width: '15%' }}>Reason</th>
                        <th style={{ width: '15%' }}>Note</th>
                        <th style={{ width: '15%' }}>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.map((absence) => (
                            <tr key={absence.id}>
                                <td>
                                    <Link to={`/member/${absence.member}`} className="report-link">
                                        {absence.sadc_member_id}. {absence.member_name}
                                    </Link>
                                </td>
                                <td>{formatDate(absence.start_date)}</td>
                                <td>{formatDate(absence.end_date) || 'N/A'}</td>
                                <td>{absence_types[absence.absence_type]}</td>
                                <td>{absence.note}</td>
                                <td>{formatDate(absence.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            </div>
        </>
    );
};

export default ReportsPage;