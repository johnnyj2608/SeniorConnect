import React, { useEffect, useRef, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import SettingsAccount from '../components/settingsContent/SettingsAccount';
import SettingsAdmin from '../components/settingsContent/SettingsAdmin';
import SettingsGeneral from '../components/settingsContent/SettingsGeneral';
import SettingsSnapshots from '../components/settingsContent/SettingsSnapshots';
import SettingsSupport from '../components/settingsContent/SettingsSupport';
import SettingsItem from '../components/items/SettingsItem';

const sections = [
    { label: 'settings.general.label', component: <SettingsGeneral />, id: 'settings-general' },
    { label: 'settings.admin.label', component: <SettingsAdmin />, id: 'settings-admin', adminOnly: true },
    { label: 'snapshots.label', component: <SettingsSnapshots />, id: 'settings-snapshots' },
    { label: 'settings.support.label', component: <SettingsSupport />, id: 'settings-support' },
    { label: 'settings.account.label', component: <SettingsAccount />, id: 'settings-account' },
];

const SettingsPage = () => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const [active, setActive] = useState(sections[0].id);
    const observer = useRef(null);

    const handleScrollToSection = (id) => {
        const section = document.getElementById(id);
        const offset = 110;
    
        if (section) {
            const top = section.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const options = {
          root: null,
          rootMargin: '-110px 0px -60% 0px',
          threshold: 0,
        };
    
        observer.current = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setActive(entry.target.id);
            }
          });
        }, options);
    
        sections.forEach((section) => {
          const sectionElement = document.getElementById(section.id);
          if (sectionElement) observer.current.observe(sectionElement);
        });
    
        return () => {
          if (observer.current) observer.current.disconnect();
        };
    }, []);
    
    return (
        <>
            <div className="page-header">
                <div className="page-title-row">
                    <h2 className="page-title">&#9782; {t('general.settings')}</h2>
                </div>
            </div>

            <div className="settings-body content-padding">
                <div className="settings-nav">
                    {sections.map((section) => {
                        if (section.adminOnly && !user?.is_org_admin) return null;

                        return (
                        <SettingsItem
                            key={section.id}
                            label={t(section.label)}
                            isNav={true}
                            isActive={active === section.id}
                            onClick={() => handleScrollToSection(section.id)}
                        />
                        );
                    })}
                </div>

                <div className="settings-content">
                {sections.map((section) => (
                    <div key={section.id} id={section.id}>
                        {section.component}
                    </div>
                ))}
                </div>
            </div>
        </>
    );
};

export default SettingsPage;