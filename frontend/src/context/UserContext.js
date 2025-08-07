import { createContext, useState, useCallback } from 'react';
import fetchWithRefresh from '../utils/fetchWithRefresh';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await fetchWithRefresh('/user/users/');
            if (!response.ok) return [];
            const data = await response.json();
            setUsers(data);
            return data;
        } catch (err) {
            console.error(err);
            return [];
        }
    }, []);

    return (
        <UserContext.Provider value={{ users, refreshUser: fetchUsers }}>
            {children}
        </UserContext.Provider>
    );
};