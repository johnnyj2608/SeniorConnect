import React, { createContext, useState, useEffect } from 'react'
import fetchWithRefresh from '../utils/fetchWithRefresh'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await fetchWithRefresh('/user/auth/me/')

				if (res.ok) {
					const data = await res.json()
					setUser(data)
				} else {
					setUser(null)
				}
			} catch (err) {
				setUser(null)
			} finally {
				setLoading(false)
			}
		}

        fetchUser()
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}