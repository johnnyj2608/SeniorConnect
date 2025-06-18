import { createContext, useEffect, useState } from 'react';
import fetchWithRefresh from '../utils/fetchWithRefresh';

export const MltcContext = createContext();

export const MltcProvider = ({ children }) => {
    const [mltcOptions, setMltcOptions] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetchWithRefresh('/core/mltcs/');
                if (!response.ok) return;
                const data = await response.json();
                setMltcOptions(data);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    return (
        <MltcContext.Provider value={{ mltcOptions, setMltcOptions }}>
            {children}
        </MltcContext.Provider>
    );
};