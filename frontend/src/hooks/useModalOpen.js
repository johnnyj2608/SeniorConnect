import { useState, useCallback } from 'react';

const useModalOpen = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
  
    const openModal = useCallback((type, data = {}) => {
        setModalData({ type, ...data });
        setModalOpen(true);
    }, []);
  
    const closeModal = useCallback(() => {
        setModalOpen(false);
        setModalData(null);
    }, []);

    return { modalOpen, modalData, openModal, closeModal };
};  

export default useModalOpen;
