import React, { useState, useEffect } from 'react';
import DownloadButton from '../components/buttons/DownloadButton';
import Dropdown from '../components/inputs/Dropdown';
import { report_types } from '../utils/mapUtils';

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
        </>
    );
};

export default ReportsPage;