import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router';
import SwitchButton from '../components/buttons/SwitchButton';
import PaginationButtons from '../components/buttons/PaginationButtons';
import MembersTable from '../components/tables/MembersTable';
import AbsencesTable from '../components/tables/AbsencesTable';
import AssessmentsTable from '../components/tables/AssessmentsTable';
import AuditsTable from '../components/tables/AuditsTable';
import EnrollmentsTable from '../components/tables/EnrollmentsTable';
import SnapshotsTable from '../components/tables/SnapshotsTable';
import useFilteredRegistry from '../hooks/useFilteredRegistry';
import MltcFilter from '../components/inputs/MltcFilter';

const registryFilters = {
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
    audit_log: [
        'create', 
        'update', 
        'delete'
    ],
    snapshots: [
        'members',
        'birthdays',
        'absences',
        'enrollments',
        'gifts',
    ],
};

const RegistryPage = () => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const typeQueryParam = queryParams.get('type');

    const [registryType, setRegistryType] = useState(typeQueryParam || 'members');
    const [registryFilter, setRegistryFilter] = useState('');

    const {
        registry,
        currentPage,
        totalPages,
        setCurrentPage,
        fetchRegistry
    } = useFilteredRegistry(registryType, registryFilter);

    const getRegistryContent = () => {
        switch (registryType) {
            case 'members':
                return <MembersTable key={currentPage} registry={registry} />;
            case 'absences':
                return <AbsencesTable key={currentPage} registry={registry} />;
            case 'enrollments':
                return <EnrollmentsTable key={currentPage} registry={registry} />;
            case 'audit_log':
                return <AuditsTable key={currentPage} registry={registry} />;
            case 'assessments':
                return <AssessmentsTable key={currentPage} registry={registry} />;
            case 'snapshots':
                return <SnapshotsTable key={currentPage} registry={registry} />;
            default:
                return null;
        }
    };

    const registryTypes = [
        'members', 
        'absences', 
        'assessments',
        'audit_log', 
        'enrollments',
    ];

    if (user?.is_org_admin || user?.view_snapshots) {
        registryTypes.push('snapshots');
    }

    useEffect(() => {
        setRegistryFilter('');
    }, [registryType]);

    return (
        <>
            <div className="page-header">
                <div className="page-title-row">
                    <h2 className="page-title">&#9782; {t('general.registry')}</h2>
                    <SwitchButton onClick={fetchRegistry} />
                </div>
                <div className="filter-row">
                    <div className="filter-content">
                        <div className="filter-option">
                            <label htmlFor="registry-type">{t('registry.registry_type')}</label>
                            <select
                                id="registry-type"
                                required
                                value={registryType}
                                onChange={(e) => setRegistryType(e.target.value)}
                            >
                                {registryTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {t(`registry.${type}.label`)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-option">
                            <label htmlFor="status-filter">{t('registry.status_filter')}</label>
                            {registryType === 'members' ? (
                                <MltcFilter
                                    value={registryFilter}
                                    onChange={setRegistryFilter}
                                />
                            ) : (
                                <select
                                    id="status-filter"
                                    required
                                    value={registryFilter}
                                    onChange={(e) => setRegistryFilter(e.target.value)}
                                >
                                    <option value="">{t('general.select_an_option')}</option>
                                    {registryFilters[registryType]?.map((filterOption) => (
                                        <option key={filterOption} value={filterOption}>
                                            {t(`registry.${registryType}.${filterOption}`)}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <PaginationButtons
                            currentPage={currentPage}
                            totalPages={totalPages}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                    <p className="filter-text">
                        {registry.length} {registry.length === 1 ? t('general.result') : t('general.results')}
                    </p>
                </div>
            </div>

            <div className="registry-content content-padding">
                {registry.length > 0 && getRegistryContent()}
            </div>
        </>
    );
};

export default RegistryPage;