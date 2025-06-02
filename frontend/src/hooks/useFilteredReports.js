import { useState, useEffect, useCallback } from 'react';
import fetchWithRefresh from '../utils/fetchWithRefresh';

const useFilteredReports = (reportType, reportFilter) => {
    const [report, setReport] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchReport = useCallback(async () => {
        if (!reportType) return;

        let endpoint;
        let api = 'core';

        if (reportType === 'absences') {
            endpoint = 'absences';
        } else if (reportType === 'enrollments') {
            endpoint = 'enrollments';
        } else if (reportType === 'audit_log') {
            endpoint = 'audits';
            api = 'audit';
        } else {
            return;
        }

        const params = new URLSearchParams({ page: currentPage });
        if (reportFilter) params.append('filter', reportFilter);

        const url = `/${api}/${endpoint}?${params.toString()}`;

        try {
            const response = await fetchWithRefresh(url);
            if (!response.ok) return;

            const data = await response.json();
            setReport(data.results);
            setTotalPages(Math.ceil(data.count / 20));
        } catch (error) {
            console.error(error);
        }
    }, [reportType, reportFilter, currentPage]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    useEffect(() => {
        setCurrentPage(1);
    }, [reportFilter]);

    useEffect(() => {
        setReport([]);
        setTotalPages(1);
        setCurrentPage(1);
    }, [reportType]);

    return { report, currentPage, totalPages, setCurrentPage, fetchReport };
};

export default useFilteredReports;