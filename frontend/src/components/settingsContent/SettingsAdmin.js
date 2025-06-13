import React, { useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import ModalPage from '../../pages/ModalPage';
import SettingsItem from '../items/SettingsItem';

const SettingsAdmin = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const openModal = useCallback(
    async (endpoint, type) => {
      if (!user?.is_org_admin) return;

      try {
        const response = await fetchWithRefresh(endpoint);
        if (!response.ok) return;

        const data = await response.json();
        setModalData({ type, data });
        setModalOpen(true);
      } catch (error) {
        console.error(error);
      }
    },
    [user?.is_org_admin]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setModalData(null);
  }, []);

  if (!user?.is_org_admin) return null;

  return (
    <>
      <h3 className="section-title">{t('settings.admin.label')}</h3>
      <div className="section-main">
        <SettingsItem label={t('model.mltc')} onClick={() => openModal('/core/mltcs', 'mltcs')} />
        <SettingsItem label={t('settings.general.language')} onClick={() => openModal('/core/languages', 'languages')} />
        <SettingsItem label={t('settings.admin.users.label')} onClick={() => openModal('/user/users', 'users')} />
        <SettingsItem label={t('settings.general.upload')} onClick={() => console.log('Upload')} />
        {modalOpen && (
          <ModalPage data={modalData} onClose={handleModalClose} />
        )}
      </div>
    </>
  );
};

export default SettingsAdmin;