import { createContext, useEffect, useState, useCallback } from 'react';
import fetchWithRefresh from '../utils/fetchWithRefresh';

export const SadcContext = createContext();

export const SadcProvider = ({ children }) => {
    const [sadc, setSadc] = useState([]);

    const fetchSadc = useCallback(async () => {
        try {
            const response = await fetchWithRefresh('/tenant/sadcs/');
            if (!response.ok) return;
            const data = await response.json();
            setSadc(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchSadc();
    }, [fetchSadc]);

    return (
        <SadcContext.Provider value={{ sadc, refreshSadc: fetchSadc }}>
            {children}
        </SadcContext.Provider>
    );
};