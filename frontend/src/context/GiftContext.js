import { createContext, useEffect, useState, useCallback } from 'react';
import fetchWithRefresh from '../utils/fetchWithRefresh';

export const GiftContext = createContext();

export const GiftProvider = ({ children }) => {
    const [gifts, setGifts] = useState([]);

    const fetchGifts = useCallback(async () => {
        try {
            const response = await fetchWithRefresh('/tenant/gifts/');
            if (!response.ok) return [];
            const data = await response.json();
            setGifts(data);
            return data;
        } catch (err) {
            console.error(err);
            return [];
        }
    }, []);

    useEffect(() => {
        fetchGifts();
    }, [fetchGifts]);

    return (
        <GiftContext.Provider value={{ gifts, refreshGift: fetchGifts }}>
            {children}
        </GiftContext.Provider>
    );
};