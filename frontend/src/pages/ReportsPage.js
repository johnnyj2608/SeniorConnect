import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'
import SwitchButton from '../components/buttons/SwitchButton';
import PaginationButtons from '../components/buttons/PaginationButtons';
import ReportAbsencesTable from '../components/reportTables/ReportAbsencesTable';
import ReportAssessmentsTable from '../components/reportTables/ReportAssessmentsTable';
import ReportAuditsTable from '../components/reportTables/ReportAuditsTable';
import ReportEnrollmentsTable from '../components/reportTables/ReportEnrollmentsTable';
import useFilteredReports from '../hooks/useFilteredReports';

const reportTypes = [
    'absences', 
    'assessments',
    'audit_log', 
    'enrollments',
];

const reportFilters = {
    absences: [
        'ongoing',
        'upcoming',
        'completed'
    ],
    assessments: [
        
    ],
    enrollments: [
        'enrollment',
        'transfer',
        'disenrollment'
    ],
    'audit_log': [
        'create', 
        'update', 
        'delete'
    ],
};

const ReportsPage = () => {
    const { t } = useTranslation();
    const [reportType, setReportType] = useState('absences');
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
            case 'absences':
                return <ReportAbsencesTable key={currentPage} report={report} />;
            case 'enrollments':
                return <ReportEnrollmentsTable key={currentPage} report={report} />;
            case 'audit_log':
                return <ReportAuditsTable key={currentPage} report={report} />;
            case 'assessments':
                return <ReportAssessmentsTable key={currentPage} report={report} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        setReportFilter('');
    }, [reportType]);

    return (
        <>
            <div className="page-header">
                <div className="page-title-row">
                    <h2 className="page-title">&#9782; {t('general.reports')}</h2>
                    <SwitchButton onClick={fetchReport} />
                </div>
                <div className="filter-row">
                    <div className="filter-content">
                        <div className="filter-option">
                            <label>{t('reports.report_type')}</label>
                            <select
                                required
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="">{t('general.select_an_option')}</option>
                                {reportTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {t(`reports.${type}.label`)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-option">
                            <label>{t('reports.status_filter')}</label>
                            <select
                                required
                                value={reportFilter}
                                onChange={(e) => setReportFilter(e.target.value)}
                            >
                                <option value="">{t('general.select_an_option')}</option>
                                {reportFilters[reportType]?.map((filterOption) => (
                                    <option key={filterOption} value={filterOption}>
                                        {t(`reports.${reportType}.${filterOption}`)}
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
                        {report.length} {report.length === 1 ? t('general.result') : t('general.results')}
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