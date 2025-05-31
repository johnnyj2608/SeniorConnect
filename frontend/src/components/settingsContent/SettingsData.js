import React, { useContext, useState, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import ModalPage from '../../pages/ModalPage';
import SettingsItem from '../items/SettingsItem'

const SettingsData = () => {
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
      console.error('Error fetching users:', error);
      alert('Could not load users. Please try again.');
    }
  }, [user]);

  const handleUsersModal = useCallback(async () => {
    if (!user?.is_org_admin) return;

    try {
      const response = await fetchWithRefresh(`/user/users`);
      if (!response.ok) return;

      const data = await response.json();
      setModalData({ type: 'users', data });
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Could not load users. Please try again.');
    }
  }, [user]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setModalData(null);
  }, []);

  return (
    <>
      <h3 className="section-title">Data</h3>
      <div className="section-main">
        <SettingsItem label="MLTC" onClick={handleMLTCModal} />
        <SettingsItem label="Language" onClick={handleMLTCModal} />
        <SettingsItem label="Upload" onClick={handleMLTCModal} />
        <SettingsItem label="User Management" onClick={handleUsersModal} />

        {modalOpen && (
          <ModalPage data={modalData} onClose={handleModalClose} />
        )}
      </div>
    </>
  );
};

export default SettingsData;
