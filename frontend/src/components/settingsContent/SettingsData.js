import React, { useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import ModalPage from '../../pages/ModalPage';
import SettingsItem from '../items/SettingsItem';

const SettingsData = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handleMLTCModal = useCallback(async () => {
    try {
      const response = await fetchWithRefresh(`/core/mltcs`);
      if (!response.ok) return;

      const data = await response.json();
      setModalData({ type: 'mltcs', data });
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching MLTC data:', error);
      alert(t('settings.data.error_load', 'Could not load data. Please try again.'));
    }
  }, [t]);

  const handleUsersModal = useCallback(async () => {
    if (!user?.is_org_admin) return;

    try {
      const response = await fetchWithRefresh(`/user/users`);
      if (!response.ok) return;

      const data = await response.json();
      setModalData({ type: 'users', data });
      setModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  }, [user, t]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setModalData(null);
  }, []);

  return (
    <>
      <h3 className="section-title">{t('settings.data.label')}</h3>
      <div className="section-main">
        <SettingsItem label={t('model.mltc')} onClick={handleMLTCModal} />
        <SettingsItem label={t('settings.general.language')} onClick={handleMLTCModal} />
        <SettingsItem label={t('settings.data.upload')} onClick={handleMLTCModal} />
        <SettingsItem label={t('settings.data.user_management')} onClick={handleUsersModal} />

        {modalOpen && (
          <ModalPage data={modalData} onClose={handleModalClose} />
        )}
      </div>
    </>
  );
};

export default SettingsData;