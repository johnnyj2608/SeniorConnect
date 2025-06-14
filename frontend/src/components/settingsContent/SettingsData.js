import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import ModalPage from '../../pages/ModalPage';
import SettingsItem from '../items/SettingsItem';

const SettingsData = () => {
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    const handleDeletedModal = useCallback(async () => {
        try {
          const response = await fetchWithRefresh(`/core/members/deleted/`);
          if (!response.ok) return;
    
          const data = await response.json();
          setModalData({ type: 'deleted', data });
          setModalOpen(true);
        } catch (error) {
          console.error(error);
        }
      }, []);

    const handleModalClose = useCallback(() => {
        setModalOpen(false);
        setModalData(null);
    }, []);

    return (
        <>
            <h3 className="section-title">{t('settings.data.label')}</h3>
            <div className="section-main">
                <SettingsItem label={t('settings.data.download_template')} onClick={() => console.log('Template')} />
                <SettingsItem label={t('settings.data.download_members')} onClick={() => console.log('Members')} />
                <SettingsItem label={t('settings.data.restore_deleted')} onClick={handleDeletedModal} />
                {/* Loader for downloads to avoid double click */}
            </div>
            {modalOpen && (
            <ModalPage data={modalData} onClose={handleModalClose} />
            )}
        </>
    );
};

export default SettingsData;