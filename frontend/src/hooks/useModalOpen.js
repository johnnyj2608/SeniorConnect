import { useContext, useState, useCallback } from 'react';
import { MltcContext } from '../context/MltcContext';
import { SadcContext } from '../context/SadcContext';
import { GiftContext } from '../context/GiftContext';
import { UserContext } from '../context/UserContext';

const useModalOpen = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
  
    const { mltcs, refreshMltc } = useContext(MltcContext);
    const { sadc, refreshSadc } = useContext(SadcContext);
    const { gifts, refreshGift } = useContext(GiftContext);
    const { users, refreshUser } = useContext(UserContext);

    const openModal = useCallback(async (type, data = {}) => {
        if (type === 'authorizations' && refreshMltc) await refreshMltc();
        if ((type === 'sadcs' || type === 'attendance' || type === 'info') && refreshSadc) await refreshSadc();
        if (type === 'gifts' && refreshGift) await refreshGift();
        if (type === 'users' && refreshUser) await refreshUser();

        setModalData({ type, ...data });
        setModalOpen(true);
    }, [refreshMltc, refreshSadc, refreshGift, refreshUser]);
  
    const closeModal = useCallback(() => {
        setModalOpen(false);
        setModalData(null);
    }, []);

    return { modalOpen, modalData, openModal, closeModal };
};  

export default useModalOpen;
