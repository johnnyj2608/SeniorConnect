import { useState, useEffect, useCallback } from 'react';
import fetchWithRefresh from '../utils/fetchWithRefresh';

const useFilteredRegistry = (registryType, registryFilter) => {
    const [registry, setregistry] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchregistry = useCallback(async () => {
        if (!registryType) return;

        let endpoint;
        let api = 'core';

        if (registryType === 'members') {
            endpoint = 'members';
        } else if (registryType === 'absences') {
            endpoint = 'absences';
        } else if (registryType === 'assessments') {
            endpoint = 'assessments';
        } else if (registryType === 'enrollments') {
            endpoint = 'enrollments';
            api = 'audit';
        } else if (registryType === 'audit_log') {
            endpoint = 'audits';
            api = 'audit';
         } else if (registryType === 'snapshots') {
            endpoint = 'snapshots';
            api = 'tenant';
        } else {
            return;
        }

        const params = new URLSearchParams({ page: currentPage });
        if (registryFilter) params.append('filter', registryFilter);

        const url = `/${api}/${endpoint}?${params.toString()}`;

        try {
            const response = await fetchWithRefresh(url);
            if (!response.ok) return;

            const data = await response.json();
            setregistry(data.results);
            setTotalPages(Math.ceil(data.count / 20));
        } catch (error) {
            console.error(error);
        }
    }, [registryType, registryFilter, currentPage]);

    useEffect(() => {
        fetchregistry();
    }, [fetchregistry]);

    useEffect(() => {
        setCurrentPage(1);
    }, [registryFilter]);

    useEffect(() => {
        setregistry([]);
        setTotalPages(1);
        setCurrentPage(1);
    }, [registryType]);

    return { registry, currentPage, totalPages, setCurrentPage, fetchregistry };
};

export default useFilteredRegistry;