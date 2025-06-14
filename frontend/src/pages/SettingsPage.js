import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import ModalPage from './ModalPage';
import useModalOpen from '../hooks/useModalOpen';

import SettingsAccount from '../components/settingsContent/SettingsAccount';
import SettingsAdmin from '../components/settingsContent/SettingsAdmin';
import SettingsGeneral from '../components/settingsContent/SettingsGeneral';
import SettingsData from '../components/settingsContent/SettingsData';
import SettingsSnapshots from '../components/settingsContent/SettingsSnapshots';
import SettingsSupport from '../components/settingsContent/SettingsSupport';
import SettingsItem from '../components/items/SettingsItem';

const scrollToSection = (id) => {
    const section = document.getElementById(id);
    const offset = 110;

    if (section) {
        const top = section.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
};

const SettingsNav = ({ activeSection, setActiveSection, user, t }) => (
    <div className="settings-nav">
        <SettingsItem
            label={t('settings.general.label')}
            isNav
            isActive={activeSection === 'settings-general'}
            onClick={() => {
                setActiveSection('settings-general');
                scrollToSection('settings-general');
            }}
        />
        {user?.is_org_admin && (
            <SettingsItem
                label={t('settings.admin.label')}
                isNav
                isActive={activeSection === 'settings-admin'}
                onClick={() => {
                    setActiveSection('settings-admin');
                    scrollToSection('settings-admin');
                }}
            />
        )}
        <SettingsItem
            label={t('settings.data.label')}
            isNav
            isActive={activeSection === 'settings-data'}
            onClick={() => {
                setActiveSection('settings-data');
                scrollToSection('settings-data');
            }}
        />
        {user?.view_snapshots && (
            <SettingsItem
                label={t('snapshots.label')}
                isNav
                isActive={activeSection === 'settings-snapshots'}
                onClick={() => {
                    setActiveSection('settings-snapshots');
                    scrollToSection('settings-snapshots');
                }}
            />
        )}
        <SettingsItem
            label={t('settings.support.label')}
            isNav
            isActive={activeSection === 'settings-support'}
            onClick={() => {
                setActiveSection('settings-support');
                scrollToSection('settings-support');
            }}
        />
        <SettingsItem
            label={t('settings.account.label')}
            isNav
            isActive={activeSection === 'settings-account'}
            onClick={() => {
                setActiveSection('settings-account');
                scrollToSection('settings-account');
            }}
        />
    </div>
);

const SettingsPage = () => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);

    const sections = [
        { id: 'settings-general' },
        { id: 'settings-admin' },
        { id: 'settings-data' },
        { id: 'settings-snapshots' },
        { id: 'settings-support' },
        { id: 'settings-account' },
    ];

    const [activeSection, setActiveSection] = useState(sections[0]?.id || 'settings-general');
    const observer = useRef(null);

    const {
        modalOpen,
        modalData,
        openModal,
        closeModal,
      } = useModalOpen();

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '-110px 0px -60% 0px',
            threshold: 0,
        };

        observer.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, options);

        sections.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.current.observe(el);
        });

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [sections]);

    const handleModalOpen = useCallback(
        (type, data) => {
          openModal(type, { data });
        },
        [openModal]
    );

    return (
        <>
            <div className="page-header">
                <div className="page-title-row">
                    <h2 className="page-title">&#9782; {t('general.settings')}</h2>
                </div>
            </div>

            <div className="settings-body content-padding">
                <SettingsNav
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    user={user}
                    t={t}
                />

                <div className="settings-content">
                    <SettingsGeneral />
                    <SettingsAdmin onEdit={handleModalOpen} />
                    <SettingsData onEdit={handleModalOpen} />
                    <SettingsSnapshots />
                    <SettingsSupport />
                    <SettingsAccount />
                </div>
            </div>

            {modalOpen && <ModalPage data={modalData} onClose={closeModal} />}
        </>
    );
};

export default SettingsPage;