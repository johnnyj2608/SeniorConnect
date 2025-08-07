import { createContext, useState, useCallback } from 'react';
import fetchWithRefresh from '../utils/fetchWithRefresh';

export const MltcContext = createContext();

export const MltcProvider = ({ children }) => {
    const [mltcs, setMltcs] = useState([]);

    const fetchMltcs = useCallback(async () => {
        try {
            const response = await fetchWithRefresh('/tenant/mltcs/');
            if (!response.ok) return [];
            const data = await response.json();
            setMltcs(data);
            return data;
        } catch (err) {
            console.error(err);
            return [];
        }
    }, []);

    return (
        <MltcContext.Provider value={{ mltcs, refreshMltc: fetchMltcs }}>
            {children}
        </MltcContext.Provider>
    );
};