import React from 'react';
import { useTranslation } from 'react-i18next';
import SettingsItem from '../items/SettingsItem';

const SettingsData = () => {
    const { t } = useTranslation();

    return (
        <>
        <h3 className="section-title">{t('settings.data.label')}</h3>
            <div className="section-main">
                <SettingsItem label={t('settings.data.download_template')} onClick={() => console.log('Template')} />
                <SettingsItem label={t('settings.data.download_members')} onClick={() => console.log('Members')} />
                <SettingsItem label={t('settings.data.restore_deleted')} onClick={() => console.log('Restore')} />
                {/* Loader for downloads to avoid double click */}
            </div>
        </>
    );
};

export default SettingsData;