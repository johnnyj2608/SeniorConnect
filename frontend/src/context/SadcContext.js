import { createContext, useEffect, useState } from 'react';
import fetchWithRefresh from '../utils/fetchWithRefresh';

export const SadcContext = createContext();

export const SadcProvider = ({ children }) => {
    const [sadc, setSadc] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetchWithRefresh('/tenant/sadc/');
                if (!response.ok) return;
                const data = await response.json();
                setSadc(data);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    return (
        <SadcContext.Provider value={{ sadc, setSadc }}>
            {children}
        </SadcContext.Provider>
    );
};