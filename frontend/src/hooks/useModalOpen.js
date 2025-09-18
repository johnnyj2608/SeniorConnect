import { useState, useCallback, useRef, useContext } from 'react';
import { MltcContext } from '../context/MltcContext';
import { SadcContext } from '../context/SadcContext';
import { GiftContext } from '../context/GiftContext';
import { UserContext } from '../context/UserContext';

const useModalOpen = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    const loadingRef = useRef(false);

    const { refreshMltc } = useContext(MltcContext);
    const { refreshSadc } = useContext(SadcContext);
    const { refreshGift } = useContext(GiftContext);
    const { refreshUser } = useContext(UserContext);

    const openModal = useCallback(async ({ id, type, setData, data = null, fetchData = null }) => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        try {
            const resolvedData = fetchData ? await fetchData() : data;

            if ((type === 'authorizations' || type === 'users') && refreshMltc) await refreshMltc();
            if ((type === 'attendance' || type === 'info') && refreshSadc) await refreshSadc();
            if (type === 'gifts' && refreshGift) await refreshGift();
            if (type === 'absences' && refreshUser) await refreshUser();

            setModalData({ id, type, setData, data: resolvedData });
            setModalOpen(true);
        } catch (err) {
            console.error(err);
        } finally {
            loadingRef.current = false;
        }
    }, [refreshMltc, refreshSadc, refreshGift, refreshUser]);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setModalData(null);
        loadingRef.current = false;
    }, []);

    return { modalOpen, modalData, openModal, closeModal };
};

export default useModalOpen;