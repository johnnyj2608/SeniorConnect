import { createContext, useEffect, useState, useCallback } from 'react';
import fetchWithRefresh from '../utils/fetchWithRefresh';

export const MltcContext = createContext();

export const MltcProvider = ({ children }) => {
    const [mltcOptions, setMltcOptions] = useState([]);

    const fetchMltcs = useCallback(async () => {
        try {
            const response = await fetchWithRefresh('/tenant/mltcs/');
            if (!response.ok) return;
            const data = await response.json();
            setMltcOptions(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchMltcs();
    }, [fetchMltcs]);

    return (
        <MltcContext.Provider value={{ mltcOptions, refreshMltc: fetchMltcs }}>
            {children}
        </MltcContext.Provider>
    );
};