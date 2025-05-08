import React, { useState, useEffect } from 'react';
import DownloadButton from '../components/buttons/DownloadButton';
import Dropdown from '../components/inputs/Dropdown';
import { formatDate } from '../utils/formatUtils';
import { report_types, absence_types } from '../utils/mapUtils';

const reportTypes = [
    { name: 'Absences', value: 'absences' },
    { name: 'Birthdays', value: 'birthdays' },
    { name: 'Enrollment', value: 'enrollment' },
  ];

const ReportsPage = () => {
    const [report, setReport] = useState([]);
    const [reportType, setReportType] = useState('absences');
    const [selectedMonthYear, setSelectedMonthYear] = useState('');

    useEffect(() => {
        const currentDate = new Date();
        const currentMonthYear = currentDate.toISOString().slice(0, 7);
        setSelectedMonthYear(currentMonthYear);
    }, []);

    useEffect(() => {
        const fetchReport = async () => {
            if (reportType === 'absences' && selectedMonthYear) {
                const [year, month] = selectedMonthYear.split('-');
                const res = await fetch(`/core/absences/?year=${year}&month=${month}`);
                const data = await res.json();
                setReport(data);
            }
            // Birthdays
            // Enrollment
        };
    
        fetchReport();
    }, [reportType, selectedMonthYear]);

    const handleMonthYearChange = (e) => {
        setSelectedMonthYear(e.target.value);
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
                                placeholder={false}
                            />
                        </div>

                        <div className="filter-option">
                            <label>Month / Year</label>
                            <input
                                type="month"
                                value={selectedMonthYear}
                                onChange={handleMonthYearChange}
                                className="month-year-picker"
                            />
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
                            <th>Member</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Reason</th>
                            <th>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.map((absence) => (
                            <tr key={absence.id}>
                                <td>{absence.member_name}</td>
                                <td>{formatDate(absence.start_date)}</td>
                                <td>{formatDate(absence.end_date) || 'N/A'}</td>
                                <td>{absence_types[absence.absence_type]}</td>
                                <td>{absence.note}</td>
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