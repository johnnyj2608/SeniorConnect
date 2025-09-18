import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import ModalPage from './ModalPage';
import useModalOpen from '../hooks/useModalOpen';
import SettingsAccount from '../components/settings/SettingsAccount';
import SettingsAdmin from '../components/settings/SettingsAdmin';
import SettingsPreferences from '../components/settings/SettingsPreferences';
import SettingsData from '../components/settings/SettingsData';
import SettingsSupport from '../components/settings/SettingsSupport';
import SettingsItem from '../components/layout/SettingsItem';

const scrollToSection = (id) => {
    const section = document.getElementById(id);
    const offset = 110;

    if (section) {
        const top = section.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
};

const SettingsNav = ({ activeSection, setActiveSection, t }) => {
    const { user } = useContext(AuthContext);

    return (
        <div className="settings-nav">
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
                label={t('settings.preferences.label')}
                isNav
                isActive={activeSection === 'settings-preferences'}
                onClick={() => {
                    setActiveSection('settings-preferences');
                    scrollToSection('settings-preferences');
                }}
            />
            <SettingsItem
                label={t('settings.data.label')}
                isNav
                isActive={activeSection === 'settings-data'}
                onClick={() => {
                    setActiveSection('settings-data');
                    scrollToSection('settings-data');
                }}
            />
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
};

const SettingsPage = () => {
    const { t } = useTranslation();

    const sections = [
        { id: 'settings-admin' },
        { id: 'settings-preferences' },
        { id: 'settings-data' },
        { id: 'settings-support' },
        { id: 'settings-account' },
    ];

    const [activeSection, setActiveSection] = useState(sections[0]?.id || 'settings-preferences');

    const { modalOpen, modalData, openModal, closeModal } = useModalOpen();

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
                    t={t}
                />

                <div className="settings-content">
                    <SettingsAdmin openModal={openModal} />
                    <SettingsPreferences />
                    <SettingsData openModal={openModal} />
                    <SettingsSupport />
                    <SettingsAccount />
                </div>
            </div>

            {modalOpen && <ModalPage data={modalData} onClose={closeModal} />}
        </>
    );
};

export default SettingsPage;