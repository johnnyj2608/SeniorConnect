import React, { useContext, useState, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import ModalPage from '../../pages/ModalPage';

const SettingsData = () => {
  const { user } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handleModalOpen = useCallback(async () => {
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
        <ul className="settings-list">
          <li>Bulk Upload</li>
          <li>MLTC</li>
          <li>Language</li>
        </ul>

        <button className="action-button" onClick={handleModalOpen}>
          Users
        </button>

        {modalOpen && (
          <ModalPage data={modalData} onClose={handleModalClose} />
        )}
      </div>
    </>
  );
};

export default SettingsData;
